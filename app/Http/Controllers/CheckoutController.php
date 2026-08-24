<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmationEmail;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(Request $request): Response
    {
        $user = Auth::user();
        $savedAddresses = [];

        if ($user) {
            $savedAddresses = Address::where('user_id', $user->id)
                ->orderBy('is_default', 'desc')
                ->latest()
                ->get();
        }

        return Inertia::render('Checkout', [
            'user' => $user,
            'savedAddresses' => $savedAddresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'payment_method' => ['required', 'string'],
            'coupon_code' => ['nullable', 'string'],
            'save_address' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        return DB::transaction(function () use ($request) {
            $items = $request->items;
            $subtotal = 0.00;
            $orderItemsData = [];

            // 1. Validate items and calculate subtotal
            foreach ($items as $item) {
                $productId = $item['id'] ?? $item['product_id'] ?? null;
                $product = Product::findOrFail($productId);
                $qty = max(1, (int) ($item['qty'] ?? $item['quantity'] ?? 1));
                $price = (float) $product->price;
                $itemTotal = round($price * $qty, 2);
                $subtotal += $itemTotal;

                // Decrement stock
                if ($product->stock_quantity >= $qty) {
                    $product->decrement('stock_quantity', $qty);
                }

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'product_image' => $product->images->first()?->image_url ?? $product->image,
                    'selected_color' => $item['selectedColor'] ?? $item['selected_color'] ?? null,
                    'selected_size' => $item['selectedSize'] ?? $item['selected_size'] ?? null,
                    'price' => $price,
                    'quantity' => $qty,
                    'total' => $itemTotal,
                ];
            }

            // 2. Validate Coupon and calculate discount
            $discountAmount = 0.00;
            $appliedCouponCode = null;

            if ($couponCode = $request->coupon_code) {
                $coupon = Coupon::where('code', strtoupper(trim($couponCode)))
                    ->where('is_active', true)
                    ->first();

                if ($coupon && $coupon->isValid($subtotal)) {
                    $discountAmount = $coupon->calculateDiscount($subtotal);
                    $appliedCouponCode = $coupon->code;
                    $coupon->increment('used_count');
                }
            }

            // 3. Calculate Tax & Shipping
            $freeShippingThreshold = 100.00;
            $shippingAmount = ($subtotal >= $freeShippingThreshold || $subtotal == 0) ? 0.00 : 15.00;
            $taxAmount = round(($subtotal - $discountAmount) * 0.08, 2); // 8% sales tax
            $totalAmount = max(0.00, round($subtotal - $discountAmount + $shippingAmount + $taxAmount, 2));

            // 4. Shipping Address object
            $shippingAddress = [
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address_line1' => $request->address_line1,
                'address_line2' => $request->address_line2,
                'city' => $request->city,
                'state' => $request->state,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
            ];

            // 5. Create Order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => Auth::id(),
                'customer_email' => $request->email,
                'customer_name' => trim("{$request->first_name} {$request->last_name}"),
                'customer_phone' => $request->phone,
                'shipping_address' => $shippingAddress,
                'billing_address' => $shippingAddress,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'coupon_code' => $appliedCouponCode,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,
                'status' => 'processing',
                'payment_status' => $request->payment_method === 'cod' ? 'unpaid' : 'paid',
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'carrier' => 'DHL Express Priority',
                'estimated_delivery' => now()->addDays(3),
                'placed_at' => now(),
            ]);

            // 6. Create Order Items
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // 7. Save Address for logged-in user if requested
            if (Auth::check() && $request->boolean('save_address')) {
                Address::firstOrCreate(
                    [
                        'user_id' => Auth::id(),
                        'address_line1' => $request->address_line1,
                        'postal_code' => $request->postal_code,
                    ],
                    array_merge($shippingAddress, [
                        'user_id' => Auth::id(),
                        'type' => 'shipping',
                        'is_default' => Address::where('user_id', Auth::id())->count() === 0,
                    ])
                );
            }

            // 8. Clear database cart for user or session
            if (Auth::check()) {
                CartItem::where('user_id', Auth::id())->delete();
            } else {
                CartItem::where('session_id', $request->session()->getId())->delete();
            }

            // 9. Send Order Confirmation Email
            try {
                Mail::to($order->customer_email)->send(new OrderConfirmationEmail($order));
            } catch (\Exception $e) {
                report($e);
            }

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'order' => $order->load('items'),
                'redirect_url' => url('/order-tracking?order=' . $order->order_number . '&email=' . urlencode($order->customer_email)),
                'message' => 'Order placed successfully!',
            ]);
        });
    }
}