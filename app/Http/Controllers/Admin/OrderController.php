<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Coupon;
use App\Models\ContactSubmission;
use App\Services\AdminNotifier;
use App\Services\ShippingRateService;
use App\Models\Setting;
use App\Mail\OrderConfirmationEmail;
use App\Mail\OrderStatusUpdateEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('items')
            ->when($request->filled('search'), fn($q) => $q->where(function ($searchQuery) use ($request) {
                $searchQuery->where('order_number', 'like', '%' . $request->search . '%')
                    ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                    ->orWhere('customer_email', 'like', '%' . $request->search . '%');
            })
            )
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('payment'), fn($q) => $q->where('payment_status', $request->payment))
            ->recent();

        $orders = $query->paginate(20)->withQueryString();
        $paymentSettings = Setting::get('payments', [
            'stripeEnabled' => true,
            'paypalEnabled' => true,
            'codEnabled' => true,
            'bankTransferEnabled' => false,
        ]);
        $orderPaymentMethods = [];
        if (($paymentSettings['stripeEnabled'] ?? true) !== false) {
            $orderPaymentMethods[] = ['id' => 'card', 'label' => 'Credit / Debit Card'];
        }
        if (($paymentSettings['paypalEnabled'] ?? true) !== false) {
            $orderPaymentMethods[] = ['id' => 'paypal', 'label' => 'PayPal'];
        }
        if (($paymentSettings['codEnabled'] ?? true) !== false) {
            $orderPaymentMethods[] = ['id' => 'cod', 'label' => 'Cash on Delivery'];
        }
        if (!empty($paymentSettings['bankTransferEnabled'])) {
            $orderPaymentMethods[] = ['id' => 'bank_transfer', 'label' => 'Bank Transfer'];
        }

        return Inertia::render('Admin/orders', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment']),
            'orderProducts' => Product::active()->with(['images', 'variants'])->orderBy('name')->get(),
            'orderCustomers' => User::customers()->orderBy('name')->get(['id', 'name', 'email']),
            'orderShippingMethods' => \App\Models\ShippingMethod::active()->get(),
            'orderCountries' => Setting::get('general', [])['storeCountries'] ?? ['Pakistan'],
            'orderPaymentMethods' => $orderPaymentMethods,
            'orderStatuses' => [
                ['id' => 'pending', 'label' => 'Pending'],
                ['id' => 'processing', 'label' => 'Processing'],
                ['id' => 'shipped', 'label' => 'Shipped'],
                ['id' => 'delivered', 'label' => 'Delivered'],
                ['id' => 'cancelled', 'label' => 'Cancelled'],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:users,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.selected_color' => ['nullable', 'string', 'max:100'],
            'items.*.selected_size' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'in:card,stripe,paypal,cod,bank_transfer'],
            'payment_status' => ['required', 'in:unpaid,paid,refunded'],
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            'shipping_method' => ['required', 'string', 'max:50'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'payment_receipt_url' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'send_confirmation' => ['nullable', 'boolean'],
            'send_customer_update_email' => ['nullable', 'boolean'],
        ]);

        $paymentSettings = Setting::get('payments', []);
        $paymentEnabled = match ($validated['payment_method']) {
            'card', 'stripe' => ($paymentSettings['stripeEnabled'] ?? true) !== false,
            'paypal' => ($paymentSettings['paypalEnabled'] ?? true) !== false,
            'cod' => ($paymentSettings['codEnabled'] ?? true) !== false,
            'bank_transfer' => !empty($paymentSettings['bankTransferEnabled']),
            default => false,
        };
        if (!$paymentEnabled) {
            return response()->json(['message' => 'This payment method is currently disabled in store settings.'], 422);
        }

        if (!empty($validated['customer_id']) && !User::customers()->whereKey($validated['customer_id'])->exists()) {
            throw ValidationException::withMessages(['customer_id' => 'Selected user is not a customer.']);
        }

        return DB::transaction(function () use ($validated) {
            $subtotal = 0.0;
            $weight = 0.0;
            $orderItems = [];
            $lowStockProducts = [];

            foreach ($validated['items'] as $item) {
                $product = Product::with('images')->whereKey($item['product_id'])->where('is_active', true)->lockForUpdate()->firstOrFail();
                $quantity = (int) $item['quantity'];
                if ($product->stock_quantity < $quantity) {
                    throw ValidationException::withMessages(['items' => "{$product->name} does not have enough stock."]);
                }

                $price = (float) $product->price;
                $itemTotal = round($price * $quantity, 2);
                $subtotal += $itemTotal;
                $weight += (float) $product->weight_kg * $quantity;
                $product->decrement('stock_quantity', $quantity);
                if ($product->fresh()->stock_quantity <= 5) $lowStockProducts[] = $product->fresh();

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'product_image' => $product->images->first()?->image_url ?? $product->image,
                    'selected_color' => $item['selected_color'] ?? null,
                    'selected_size' => $item['selected_size'] ?? null,
                    'price' => $price,
                    'quantity' => $quantity,
                    'total' => $itemTotal,
                ];
            }

            $discount = 0.0;
            $couponCode = null;
            if (!empty($validated['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper(trim($validated['coupon_code'])))->where('is_active', true)->lockForUpdate()->first();
                if (!$coupon || !$coupon->isValid($subtotal)) {
                    throw ValidationException::withMessages(['coupon_code' => 'This coupon is invalid, expired, exhausted, or the minimum spend has not been reached.']);
                }
                $discount = $coupon->calculateDiscount($subtotal);
                $couponCode = $coupon->code;
                $coupon->increment('used_count');
            }

            $shippingSettings = Setting::get('shipping', []);
            $taxConfig = $shippingSettings['tax'] ?? [];
            $taxRate = (float) ($taxConfig['flatRate'] ?? 8);
            $taxIncluded = (bool) ($taxConfig['taxIncluded'] ?? false);
            $shippingRate = app(ShippingRateService::class)->rate($validated['shipping_method'], $validated['country'], $subtotal, $weight);
            $shippingAmount = (float) $shippingRate['amount'];
            $taxAmount = $taxIncluded ? 0.0 : round(($subtotal - $discount) * ($taxRate / 100), 2);
            $total = max(0.0, round($subtotal - $discount + $shippingAmount + $taxAmount, 2));
            $shippingAddress = [
                'first_name' => $validated['first_name'], 'last_name' => $validated['last_name'] ?? '',
                'email' => $validated['email'], 'phone' => $validated['phone'],
                'address_line1' => $validated['address_line1'], 'address_line2' => $validated['address_line2'] ?? '',
                'city' => $validated['city'], 'state' => $validated['state'],
                'postal_code' => $validated['postal_code'], 'country' => $validated['country'],
            ];

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(), 'tracking_token' => Str::random(48),
                'user_id' => $validated['customer_id'] ?? null, 'customer_email' => $validated['email'],
                'customer_name' => trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? '')),
                'customer_phone' => $validated['phone'], 'shipping_address' => $shippingAddress, 'billing_address' => $shippingAddress,
                'subtotal' => $subtotal, 'discount_amount' => $discount, 'coupon_code' => $couponCode,
                'tax_amount' => $taxAmount, 'shipping_amount' => $shippingAmount, 'total_amount' => $total,
                'status' => $validated['status'], 'payment_status' => $validated['payment_status'],
                'payment_method' => $validated['payment_method'], 'payment_receipt_url' => $validated['payment_receipt_url'] ?? null,
                'notes' => $validated['notes'] ?? null, 'carrier' => 'DHL Express Priority',
                'estimated_delivery' => now()->addDays(3), 'placed_at' => now(),
            ]);
            foreach ($orderItems as $item) $order->items()->create($item);

            AdminNotifier::notifyNewOrder($order);
            foreach ($lowStockProducts as $product) AdminNotifier::notifyLowStock($product);
            if (!empty($validated['send_confirmation']) || !empty($validated['send_customer_update_email'])) {
                try {
                    Mail::to($order->customer_email)->send(new OrderConfirmationEmail($order->load('items')));
                } catch (\Throwable $exception) {
                    report($exception);
                }
            }

            return response()->json(['success' => true, 'message' => "Order #{$order->order_number} created successfully.", 'order' => $order->load('items')], 201);
        });
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,delivered,cancelled'],
            'send_customer_update_email' => ['nullable', 'boolean'],
        ]);

        $order = Order::findOrFail($id);

        if ($order->status === 'cancelled' && $request->status !== 'cancelled') {
            return response()->json(['message' => 'A cancelled order cannot be reopened.'], 422);
        }

        $order->status = $request->status;

        if ($request->status === 'shipped') {
            $order->tracking_number = $request->tracking_number ?? $order->tracking_number;
            $order->carrier = $request->carrier ?? $order->carrier;
        }

        $order->save();

        if ($request->boolean('send_customer_update_email')) {
            try {
                Mail::to($order->customer_email)->send(new OrderStatusUpdateEmail($order, 'Status updated'));
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function updatePaymentStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'payment_status' => ['required', 'in:unpaid,paid,refunded'],
            'send_customer_update_email' => ['nullable', 'boolean'],
        ]);

        $order = Order::findOrFail($id);
        $order->payment_status = $request->payment_status;
        $order->save();

        if ($request->boolean('send_customer_update_email')) {
            try {
                Mail::to($order->customer_email)->send(new OrderStatusUpdateEmail($order, 'Payment updated'));
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:users,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'items.*.selected_color' => ['nullable', 'string', 'max:100'],
            'items.*.selected_size' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'in:card,stripe,paypal,cod,bank_transfer'],
            'payment_status' => ['required', 'in:unpaid,paid,refunded'],
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            'shipping_method' => ['required', 'string', 'max:50'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'payment_receipt_url' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'send_customer_update_email' => ['nullable', 'boolean'],
        ]);

        $order = Order::with('items')->findOrFail($id);

        return DB::transaction(function () use ($order, $validated) {
            foreach ($order->items as $existingItem) {
                if (!empty($existingItem->product_id)) {
                    Product::whereKey($existingItem->product_id)->lockForUpdate()->increment('stock_quantity', $existingItem->quantity);
                }
                if (!empty($existingItem->variant_id)) {
                    ProductVariant::whereKey($existingItem->variant_id)->lockForUpdate()->increment('stock_quantity', $existingItem->quantity);
                }
            }

            $subtotal = 0.0;
            $weight = 0.0;
            $newItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::with(['images', 'variants'])->whereKey($item['product_id'])->where('is_active', true)->lockForUpdate()->firstOrFail();
                $quantity = (int) $item['quantity'];

                $variant = null;
                if (!empty($item['variant_id'])) {
                    $variant = ProductVariant::whereKey($item['variant_id'])
                        ->where('product_id', $product->id)
                        ->lockForUpdate()
                        ->first();
                    if (!$variant) {
                        throw ValidationException::withMessages(['items' => "The selected variant does not belong to {$product->name}."]);
                    }
                } elseif ($product->variants->isNotEmpty()) {
                    throw ValidationException::withMessages(['items' => "Select a variant for {$product->name}."]);
                }

                if ($product->stock_quantity < $quantity) {
                    throw ValidationException::withMessages(['items' => "{$product->name} does not have enough stock."]);
                }

                if ($variant && $variant->stock_quantity < $quantity) {
                    throw ValidationException::withMessages(['items' => "The selected variant of {$product->name} does not have enough stock."]);
                }

                $price = (float) $product->price + (float) ($variant?->additional_price ?? 0);
                $itemTotal = round($price * $quantity, 2);
                $subtotal += $itemTotal;
                $weight += (float) $product->weight_kg * $quantity;
                $product->decrement('stock_quantity', $quantity);
                $variant?->decrement('stock_quantity', $quantity);

                $newItems[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'product_sku' => $variant?->sku ?: $product->sku,
                    'product_image' => $product->images->first()?->image_url ?? $product->image,
                    'selected_color' => $variant?->color_name ?? ($item['selected_color'] ?? null),
                    'selected_size' => $variant?->size ?? ($item['selected_size'] ?? null),
                    'price' => $price,
                    'quantity' => $quantity,
                    'total' => $itemTotal,
                ];
            }

            $requestedCouponCode = strtoupper(trim($validated['coupon_code'] ?? ''));
            $existingCouponCode = strtoupper(trim($order->coupon_code ?? ''));
            $discount = 0.0;
            $couponCode = null;
            if ($requestedCouponCode !== '' && $requestedCouponCode === $existingCouponCode) {
                $discount = (float) $order->discount_amount;
                $couponCode = $order->coupon_code;
            } elseif ($requestedCouponCode !== '') {
                $coupon = Coupon::where('code', $requestedCouponCode)->where('is_active', true)->lockForUpdate()->first();
                if (!$coupon || !$coupon->isValid($subtotal)) {
                    throw ValidationException::withMessages(['coupon_code' => 'This coupon is invalid, expired, exhausted, or the minimum spend has not been reached.']);
                }
                $discount = $coupon->calculateDiscount($subtotal);
                $couponCode = $coupon->code;
                $coupon->increment('used_count');
            }

            $shippingSettings = Setting::get('shipping', []);
            $taxConfig = $shippingSettings['tax'] ?? [];
            $taxRate = (float) ($taxConfig['flatRate'] ?? 8);
            $taxIncluded = (bool) ($taxConfig['taxIncluded'] ?? false);
            $shippingRate = app(ShippingRateService::class)->rate($validated['shipping_method'], $validated['country'], $subtotal, $weight);
            $shippingAmount = (float) $shippingRate['amount'];
            $taxAmount = $taxIncluded ? 0.0 : round(($subtotal - $discount) * ($taxRate / 100), 2);
            $total = max(0.0, round($subtotal - $discount + $shippingAmount + $taxAmount, 2));

            $shippingAddress = [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'] ?? '',
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? '',
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'country' => $validated['country'],
            ];

            $order->user_id = $validated['customer_id'] ?? $order->user_id;
            $order->customer_email = $validated['email'];
            $order->customer_name = trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? ''));
            $order->customer_phone = $validated['phone'];
            $order->shipping_address = $shippingAddress;
            $order->billing_address = $shippingAddress;
            $order->subtotal = $subtotal;
            $order->discount_amount = $discount;
            $order->coupon_code = $couponCode;
            $order->tax_amount = $taxAmount;
            $order->shipping_amount = $shippingAmount;
            $order->total_amount = $total;
            $order->status = $validated['status'];
            $order->payment_status = $validated['payment_status'];
            $order->payment_method = $validated['payment_method'];
            $order->payment_receipt_url = $validated['payment_receipt_url'] ?? $order->payment_receipt_url;
            $order->notes = $validated['notes'] ?? $order->notes;
            $order->save();

            $order->items()->delete();
            foreach ($newItems as $item) {
                $order->items()->create($item);
            }

            if ($request->boolean('send_customer_update_email')) {
                try {
                    Mail::to($order->customer_email)->send(new OrderStatusUpdateEmail($order->fresh(['items']), 'Order updated'));
                } catch (\Throwable $exception) {
                    report($exception);
                }
            }

            return response()->json(['success' => true, 'message' => "Order #{$order->order_number} updated successfully.", 'order' => $order->fresh(['items'])]);
        }, 3);
    }

    public function addTracking(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'tracking_number' => ['required', 'string'],
            'carrier' => ['nullable', 'string'],
        ]);

        $order = Order::findOrFail($id);
        $order->tracking_number = $request->tracking_number;
        $order->carrier = $request->carrier ?? $order->carrier ?? 'DHL Express';
        $order->status = 'shipped';
        $order->save();

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function resendEmail(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        Mail::to($order->customer_email)->send(new OrderConfirmationEmail($order));

        return response()->json(['success' => true, 'message' => 'Order confirmation email sent.']);
    }

    public function packingSlip(int $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $store = Setting::get('general', []);

        return view('admin.orders.packing-slip', compact('order', 'store'));
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $request->validate(['note' => ['required', 'string', 'max:2000']]);
        $order = Order::findOrFail($id);
        $notes = json_decode($order->notes ?: '[]', true);
        $notes = is_array($notes) ? $notes : [];
        $notes[] = [
            'author' => $request->user()->name ?? 'Admin',
            'text' => $request->note,
            'time' => now()->format('M d, Y h:i A'),
        ];
        $order->notes = json_encode($notes);
        $order->save();

        return response()->json(['success' => true, 'notes' => $notes]);
    }

    public function destroy(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        ContactSubmission::where('order_id', (string) $order->id)
            ->orWhere('order_id', $order->order_number)
            ->delete();

        $order->items()->delete();
        $order->delete();

        return response()->json(['success' => true]);
    }
}