<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderReviewController extends Controller
{
    public function show(string $token): Response
    {
        $order = Order::query()
            ->where('review_token', $token)
            ->where('status', 'delivered')
            ->with('items.product')
            ->firstOrFail();

        $productIds = $order->items->pluck('product_id')->filter()->unique()->values();
        $reviewedProductIds = Review::query()
            ->where('order_id', $order->id)
            ->whereIn('product_id', $productIds)
            ->pluck('product_id');

        if ($order->user_id) {
            $reviewedProductIds = $reviewedProductIds->merge(
                Review::query()
                    ->where('user_id', $order->user_id)
                    ->whereIn('product_id', $productIds)
                    ->pluck('product_id')
            );
        }

        $reviewedProductIds = $reviewedProductIds->unique()->map(fn ($id) => (int) $id)->all();

        $items = $order->items->map(fn (OrderItem $item) => [
            'name' => $item->product_name,
            'image' => $item->product_image ?: $item->product?->image,
            'color' => $item->selected_color,
            'size' => $item->selected_size,
            'quantity' => $item->quantity,
            'price' => (float) $item->price,
            'total' => (float) $item->total,
        ])->values();

        $reviewProducts = $order->items
            ->filter(fn (OrderItem $item) => $item->product_id !== null)
            ->groupBy('product_id')
            ->map(function ($productItems, $productId) use ($reviewedProductIds) {
                /** @var OrderItem $firstItem */
                $firstItem = $productItems->first();

                return [
                    'product_id' => (int) $productId,
                    'name' => $firstItem->product_name,
                    'image' => $firstItem->product_image ?: $firstItem->product?->image,
                    'quantity' => (int) $productItems->sum('quantity'),
                    'reviewed' => in_array((int) $productId, $reviewedProductIds, true),
                ];
            })
            ->values();

        return Inertia::render('OrderReview', [
            'reviewToken' => $token,
            'order' => [
                'order_number' => $order->order_number,
                'placed_at' => $order->placed_at?->toIso8601String(),
                'status' => $order->status,
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount_amount,
                'shipping' => (float) $order->shipping_amount,
                'tax' => (float) $order->tax_amount,
                'total' => (float) $order->total_amount,
            ],
            'items' => $items,
            'reviewProducts' => $reviewProducts,
        ]);
    }

    public function store(Request $request, string $token): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['nullable', 'string', 'max:150'],
            'comment' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:3'],
            'attachments.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $order = Order::query()
            ->where('review_token', $token)
            ->where('status', 'delivered')
            ->firstOrFail();
        abort_unless(
            OrderItem::query()
                ->where('order_id', $order->id)
                ->where('product_id', $validated['product_id'])
                ->exists(),
            404
        );

        $alreadyReviewed = Review::query()
            ->where('order_id', $order->id)
            ->where('product_id', $validated['product_id'])
            ->exists();
        if (!$alreadyReviewed && $order->user_id) {
            $alreadyReviewed = Review::query()
                ->where('user_id', $order->user_id)
                ->where('product_id', $validated['product_id'])
                ->exists();
        }
        if ($alreadyReviewed) {
            return response()->json(['message' => 'A review has already been submitted for this product.'], 409);
        }

        $attachments = collect($request->file('attachments', []))
            ->map(fn ($file) => ProductImageService::optimize($file, "reviews/{$validated['product_id']}"))
            ->all();

        $review = DB::transaction(function () use ($token, $validated, $attachments) {
            $order = Order::query()
                ->where('review_token', $token)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless($order->status === 'delivered', 404);
            abort_unless(
                OrderItem::query()
                    ->where('order_id', $order->id)
                    ->where('product_id', $validated['product_id'])
                    ->exists(),
                404
            );

            $alreadyReviewed = Review::query()
                ->where('order_id', $order->id)
                ->where('product_id', $validated['product_id'])
                ->exists();

            if (!$alreadyReviewed && $order->user_id) {
                $alreadyReviewed = Review::query()
                    ->where('user_id', $order->user_id)
                    ->where('product_id', $validated['product_id'])
                    ->exists();
            }

            if ($alreadyReviewed) {
                return null;
            }

            return Review::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'product_id' => $validated['product_id'],
                'author_name' => $order->customer_name,
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'comment' => $validated['comment'],
                'is_verified_buyer' => true,
                'status' => 'pending',
                'attachments' => $attachments,
            ]);
        });

        if (!$review) {
            return response()->json(['message' => 'A review has already been submitted for this product.'], 409);
        }

        return response()->json([
            'message' => 'Your review was submitted for approval.',
            'review' => $review,
        ], 201);
    }
}
