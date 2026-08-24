<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
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
        $quantity = (int) ($request->quantity ?? 1);
        $userId = Auth::id();
        $sessionId = Auth::check() ? null : $request->session()->getId();

        $matchAttributes = [
            'product_id' => $product->id,
            'selected_color' => $request->selected_color,
            'selected_size' => $request->selected_size,
        ];

        if (Auth::check()) {
            $matchAttributes['user_id'] = $userId;
        } else {
            $matchAttributes['session_id'] = $sessionId;
        }

        $cartItem = CartItem::where($matchAttributes)->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create(array_merge($matchAttributes, [
                'variant_id' => $request->variant_id,
                'quantity' => $quantity,
                'price' => $product->price,
            ]));
        }

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

            $existing = CartItem::where([
                'user_id' => $userId,
                'product_id' => $product->id,
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
                    'selected_color' => $selectedColor,
                    'selected_size' => $selectedSize,
                    'quantity' => $qty,
                    'price' => $product->price,
                ]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Cart synchronized.']);
    }
}