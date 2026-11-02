<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(string $slug): Response
    {
        $product = Product::active()
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)
                    ->orWhere('id', $slug);
            })
            ->with([
                'category:id,name,slug',
                'images:id,product_id,image_url,alt_text,sort_order',
                'variants:id,product_id,color_name,color_hex,size,sku,additional_price,stock_quantity,image_url',
            ])
            ->withCount('reviews')
            ->firstOrFail();

        $product->increment('views');

        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->forCards()
            ->take(4)
            ->get();

        $reviewRatingCounts = $product->reviews()
            ->reorder()
            ->selectRaw('rating, COUNT(*) as review_count')
            ->groupBy('rating')
            ->pluck('review_count', 'rating')
            ->map(fn ($count) => (int) $count)
            ->all();
        $reviewCount = (int) $product->reviews_count;
        $reviewAverage = $reviewCount > 0
            ? collect($reviewRatingCounts)->sum(fn ($count, $rating) => $count * (int) $rating) / $reviewCount
            : (float) $product->rating;
        $initialReviews = $product->reviews()
            ->select(['id', 'product_id', 'author_name', 'rating', 'title', 'comment', 'is_verified_buyer', 'attachments', 'created_at'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(8);
        $user = request()->user();
        $hasReviewed = $user
            ? Review::where('product_id', $product->id)->where('user_id', $user->id)->exists()
            : false;
        $canReview = $user?->isCustomer()
            && ! $hasReviewed
            && Order::where('user_id', $user->id)
                ->where('status', 'delivered')
                ->where('payment_status', '!=', 'refunded')
                ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
                ->exists();

        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? '';
        $requestRoot = rtrim(request()->root(), '/');
        $productImage = $product->images->first()?->image_url ?? $product->image ?? asset('build/assets/hero.jpg');
        $canonicalPath = route('product-detail', ['slug' => $product->slug], false);
        $canonicalUrl = $requestRoot.$canonicalPath;
        $productDescription = substr($product->description ?? $product->tagline ?? $product->name, 0, 160);
        $metaTitle = $product->seo_title ?: ($product->name.' | '.$storeName);
        $metaDescription = $product->seo_description ?: $productDescription;
        $metaKeywords = $product->seo_keywords ?? '';
        $ogImage = filter_var($productImage, FILTER_VALIDATE_URL)
            ? $productImage
            : (str_starts_with($productImage, '//') ? 'https:'.$productImage : (str_starts_with($productImage, '/') ? $requestRoot.$productImage : url($productImage)));
        $ogImage = filter_var($ogImage, FILTER_VALIDATE_URL) ? $ogImage : asset('build/assets/hero.jpg');

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'reviews' => $initialReviews->items(),
            'reviewRatingCounts' => $reviewRatingCounts,
            'reviewAverage' => $reviewAverage,
            'reviewPage' => $initialReviews->currentPage(),
            'reviewLastPage' => $initialReviews->lastPage(),
            'reviewTotal' => $initialReviews->total(),
            'canReview' => (bool) $canReview,
            'hasReviewed' => $hasReviewed,
        ])->withViewData([
            'metaTitle' => $metaTitle,
            'metaDescription' => $metaDescription,
            'metaKeywords' => $metaKeywords,
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'product',
            'ogTitle' => $metaTitle,
            'ogDescription' => $metaDescription,
            'ogImage' => $ogImage,
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => $metaTitle,
            'twitterDescription' => $metaDescription,
        ]);
    }

    public function reviews(Request $request, string $slug): JsonResponse
    {
        $filters = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'q' => ['nullable', 'string', 'max:100'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
        ]);

        $product = Product::active()
            ->select('id')
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('id', $slug))
            ->firstOrFail();

        $reviews = Review::query()
            ->where('product_id', $product->id)
            ->where('status', 'approved')
            ->when($filters['rating'] ?? null, fn ($query, $rating) => $query->where('rating', $rating))
            ->when(trim($filters['q'] ?? '') !== '', function ($query) use ($filters) {
                $search = '%'.trim($filters['q']).'%';
                $query->where(fn ($searchQuery) => $searchQuery
                    ->where('author_name', 'like', $search)
                    ->orWhere('title', 'like', $search)
                    ->orWhere('comment', 'like', $search));
            })
            ->select(['id', 'product_id', 'author_name', 'rating', 'title', 'comment', 'is_verified_buyer', 'attachments', 'created_at'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(8, ['*'], 'page', (int) ($filters['page'] ?? 1));

        return response()->json([
            'reviews' => $reviews->items(),
            'page' => $reviews->currentPage(),
            'lastPage' => $reviews->lastPage(),
        ]);
    }

    public function submitReview(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();
        abort_unless($user?->isCustomer(), 403, 'Sign in with a customer account to write a review.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['nullable', 'string', 'max:150'],
            'comment' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:3'],
            'attachments.*' => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $product = Product::active()
            ->where(fn ($query) => $query->where('slug', $slug)->orWhere('id', $slug))
            ->firstOrFail();

        $hasQualifyingPurchase = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->where('payment_status', '!=', 'refunded')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->exists();
        abort_unless($hasQualifyingPurchase, 403, 'A delivered order for this product is required to write a review.');

        if (Review::where('product_id', $product->id)->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'You have already reviewed this product.',
            ], 409);
        }

        $attachments = collect($request->file('attachments', []))
            ->map(fn ($file) => ProductImageService::optimize($file, "reviews/{$product->id}"))
            ->all();

        $review = DB::transaction(fn () => Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'author_name' => $user->name,
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'is_verified_buyer' => true,
            'status' => 'pending',
            'attachments' => $attachments,
        ]));

        return response()->json([
            'message' => 'Your verified purchase review was submitted for approval.',
            'review' => $review,
        ], 201);
    }
}
