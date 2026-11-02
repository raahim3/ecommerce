<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    private function getCartQuery(Request $request)
    {
        if (Auth::check()) {
            return CartItem::where('user_id', Auth::id());
        }

        $sessionId = $request->session()->getId();
        return CartItem::where('session_id', $sessionId);
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->getCartQuery($request)
            ->with(['product.category', 'product.images', 'variant'])
            ->get();

        $subtotal = $items->sum(function ($item) {
            return $item->quantity * (float) $item->price;
        });

        return response()->json([
            'items' => $items,
            'count' => $items->sum('quantity'),
            'subtotal' => round($subtotal, 2),
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'selected_color' => ['nullable', 'string'],
            'selected_size' => ['nullable', 'string'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
        ]);

        $product = Product::findOrFail($request->product_id);
        $variant = null;
        if ($request->filled('variant_id')) {
            $variant = ProductVariant::whereKey($request->variant_id)
                ->where('product_id', $product->id)
                ->first();

            if (! $variant
                || ($variant->size && $variant->size !== $request->selected_size)
                || ($variant->color_name && $variant->color_name !== $request->selected_color)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected curtain size or color is unavailable.',
                ], 422);
            }
        } elseif ($product->variants()->exists()) {
            $variantQuery = ProductVariant::where('product_id', $product->id);
            $request->filled('selected_size')
                ? $variantQuery->where('size', $request->selected_size)
                : $variantQuery->whereNull('size');
            $request->filled('selected_color')
                ? $variantQuery->where('color_name', $request->selected_color)
                : $variantQuery->whereNull('color_name');
            $variant = $variantQuery->first();

            if (! $variant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Select an available curtain size and color.',
                ], 422);
            }
        }

        $quantity = max(1, (int) ($request->quantity ?? 1));
        $availableStock = max(0, (int) $product->stock_quantity);

        if ($availableStock <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This product is currently out of stock.',
            ], 422);
        }

        $userId = Auth::id();
        $sessionId = Auth::check() ? null : $request->session()->getId();

        $matchAttributes = [
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'selected_color' => $request->selected_color,
            'selected_size' => $request->selected_size,
        ];

        if (Auth::check()) {
            $matchAttributes['user_id'] = $userId;
        } else {
            $matchAttributes['session_id'] = $sessionId;
        }

        $cartItem = CartItem::where($matchAttributes)->first();
        $newQuantity = $cartItem ? ($cartItem->quantity + $quantity) : $quantity;
        $currentProductQuantity = $this->getCartQuery($request)
            ->where('product_id', $product->id)
            ->sum('quantity');

        if ($currentProductQuantity + $quantity > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$availableStock} item(s) available in stock.",
            ], 422);
        }

        if ($variant) {
            $currentVariantQuantity = $this->getCartQuery($request)
                ->where('variant_id', $variant->id)
                ->sum('quantity');
            if ($currentVariantQuantity + $quantity > $variant->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Only {$variant->stock_quantity} item(s) of size {$variant->size} available in stock.",
                ], 422);
            }
        }

        if ($cartItem) {
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create(array_merge($matchAttributes, [
                'variant_id' => $variant?->id,
                'quantity' => $quantity,
                'price' => (float) $product->price + (float) ($variant?->additional_price ?? 0),
            ]));
        }

        $product->increment('add_to_cart_count');

        return response()->json([
            'success' => true,
            'message' => 'Item added to bag.',
            'item' => $cartItem->load(['product', 'variant']),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'id' => ['required', 'exists:cart_items,id'],
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $item = $this->getCartQuery($request)->where('id', $request->id)->firstOrFail();

        if ($request->quantity <= 0) {
            $item->delete();
            return response()->json(['success' => true, 'message' => 'Item removed from bag.']);
        }

        $availableStock = max(0, (int) ($item->product?->stock_quantity ?? $item->product()->value('stock_quantity') ?? 0));
        $otherProductQuantity = $this->getCartQuery($request)
            ->where('product_id', $item->product_id)
            ->whereKeyNot($item->id)
            ->sum('quantity');
        if ($otherProductQuantity + $request->quantity > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$availableStock} item(s) available in stock.",
            ], 422);
        }

        if ($item->variant_id) {
            $variant = ProductVariant::find($item->variant_id);
            $otherVariantQuantity = $this->getCartQuery($request)
                ->where('variant_id', $item->variant_id)
                ->whereKeyNot($item->id)
                ->sum('quantity');
            if (! $variant || $otherVariantQuantity + $request->quantity > $variant->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected curtain size does not have enough stock.',
                ], 422);
            }
        }

        if ($availableStock <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This product is currently out of stock.',
            ], 422);
        }

        $item->quantity = $request->quantity;
        $item->save();

        return response()->json(['success' => true, 'item' => $item]);
    }

    public function remove(Request $request, int $id): JsonResponse
    {
        $this->getCartQuery($request)->where('id', $id)->delete();
        return response()->json(['success' => true, 'message' => 'Item removed.']);
    }

    public function clear(Request $request): JsonResponse
    {
        $this->getCartQuery($request)->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared.']);
    }

    public function sync(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['success' => false], 401);
        }

        $request->validate([
            'items' => ['required', 'array'],
        ]);

        $userId = Auth::id();

        foreach ($request->items as $item) {
            $productId = $item['id'] ?? $item['product_id'] ?? null;
            if (!$productId) continue;

            $product = Product::find($productId);
            if (!$product) continue;

            $selectedColor = $item['selectedColor'] ?? $item['selected_color'] ?? null;
            $selectedSize = $item['selectedSize'] ?? $item['selected_size'] ?? null;
            $qty = (int) ($item['quantity'] ?? 1);

            $variantId = $item['variant_id'] ?? null;
            $existing = CartItem::where([
                'user_id' => $userId,
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'selected_color' => $selectedColor,
                'selected_size' => $selectedSize,
            ])->first();

            if ($existing) {
                $existing->quantity = max($existing->quantity, $qty);
                $existing->save();
            } else {
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'variant_id' => $variantId,
                    'selected_color' => $selectedColor,
                    'selected_size' => $selectedSize,
                    'quantity' => $qty,
                    'price' => (float) $product->price + (float) ProductVariant::find($variantId)?->additional_price,
                ]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Cart synchronized.']);
    }
}