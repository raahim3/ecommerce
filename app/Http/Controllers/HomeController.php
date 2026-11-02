<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->select(['id', 'name', 'slug', 'image', 'parent_id', 'sort_order'])
            ->orderBy('sort_order')
            ->get();

        $categoryProductCounts = Product::where('is_active', true)
            ->selectRaw('category_id, subcategory_id, COUNT(*) as products_count')
            ->whereNotNull('category_id')
            ->groupBy('category_id', 'subcategory_id')
            ->get()
            ->reduce(function ($totals, $row) {
                $totals[$row->category_id] = ($totals[$row->category_id] ?? 0) + (int) $row->products_count;
                if (! is_null($row->subcategory_id)) {
                    $totals[$row->subcategory_id] = ($totals[$row->subcategory_id] ?? 0) + (int) $row->products_count;
                }

                return $totals;
            }, []);

        $categories->each(function ($cat) use ($categoryProductCounts) {
            $cat->products_count = (int) ($categoryProductCounts[$cat->id] ?? 0);
        });

        $homepage = Setting::get('homepage', []);
        $trendingIds = collect($homepage['trendingProductIds'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();

        $bestSellerSales = DB::table('order_items')
            ->join('orders', function ($join) {
                $join->on('orders.id', '=', 'order_items.order_id')
                    ->where('orders.payment_status', 'paid');
            })
            ->select(
                'order_items.product_id',
                DB::raw('SUM(order_items.quantity) as total_sold')
            )
            ->groupBy('order_items.product_id');

        if (($homepage['trendingMode'] ?? 'automatic') === 'manual' && $trendingIds->isNotEmpty()) {
            $trendingProducts = Product::active()
                ->forCards()
                ->whereIn('id', $trendingIds)
                ->get()
                ->sortBy(fn ($product) => $trendingIds->search($product->id))
                ->values()
                ->take(8);
        } else {
            $trendingProducts = Product::active()
                ->forCards()
                ->leftJoinSub($bestSellerSales, 'best_seller_sales', function ($join) {
                    $join->on('best_seller_sales.product_id', '=', 'products.id');
                })
                ->orderByDesc(DB::raw('COALESCE(best_seller_sales.total_sold, 0)'))
                ->orderByDesc('products.created_at')
                ->take(8)
                ->get();
        }

        $flashSaleProducts = Product::active()
            ->onSale()
            ->forCards()
            ->take(6)
            ->get();

        $bestSellerCategoryIds = collect($homepage['bestSellerCategoryIds'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();
        $bestSellerCategories = $bestSellerCategoryIds->isNotEmpty()
            ? $categories->filter(fn ($category) => $bestSellerCategoryIds->contains($category->id))->values()
            : $categories;

        $bestSellers = Product::active()
            ->forCards()
            ->leftJoinSub($bestSellerSales, 'best_seller_sales', function ($join) {
                $join->on('best_seller_sales.product_id', '=', 'products.id');
            })
            ->orderByDesc(DB::raw('COALESCE(best_seller_sales.total_sold, 0)'))
            ->orderByDesc('products.created_at')
            ->take(20)
            ->get();

        $originalReviews = Review::where('status', 'approved')
            ->with('product:id,name')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'quote' => $review->comment,
                'name' => $review->author_name,
                'role' => $review->product?->name ?: 'Verified Customer',
                'attachments' => is_array($review->attachments) ? $review->attachments : [],
            ]);
        $reviews = ($homepage['reviewsMode'] ?? 'original') === 'manual'
            ? collect($homepage['manualReviews'] ?? [])->take(6)->values()
            : $originalReviews;

        $heroProductQuery = Product::active()->forCards();
        $heroProduct = ! empty($homepage['heroProductId'])
            ? (clone $heroProductQuery)->find($homepage['heroProductId'])
            : null;
        $heroProduct ??= $heroProductQuery->latest()->first();

        $seo = Setting::get('seo', []);
        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? '';
        if (($seo['metaTitle'] ?? null)) {
            $seo['metaTitle'] = preg_replace('/^ATELIER\\b/', $storeName, $seo['metaTitle']);
        }
        if (($seo['ogTitle'] ?? null)) {
            $seo['ogTitle'] = preg_replace('/^ATELIER\\b/', $storeName, $seo['ogTitle']);
        }
        $requestRoot = rtrim(request()->root(), '/');
        $canonicalUrl = $requestRoot.route('home', [], false);
        $ogImage = $seo['ogImage'] ?? ($general['logoLight'] ?? asset('build/assets/hero.jpg'));
        if (! filter_var($ogImage, FILTER_VALIDATE_URL)) {
            $ogImage = str_starts_with($ogImage, '//') ? 'https:'.$ogImage : (str_starts_with($ogImage, '/') ? $requestRoot.$ogImage : url($ogImage));
        }
        $ogImage = filter_var($ogImage, FILTER_VALIDATE_URL) ? $ogImage : asset('build/assets/hero.jpg');

        return Inertia::render('Home', [
            'categories' => $categories,
            'trendingProducts' => $trendingProducts,
            'flashSaleProducts' => $flashSaleProducts,
            'bestSellers' => $bestSellers,
            'bestSellerCategories' => $bestSellerCategories,
            'recentReviews' => $reviews,
            'heroProduct' => $heroProduct,
        ])->withViewData([
            'metaTitle' => $seo['metaTitle'] ?? $storeName,
            'metaDescription' => $seo['metaDescription'] ?? 'Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods.',
            'metaKeywords' => $seo['metaKeywords'] ?? '',
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => $seo['ogTitle'] ?? $seo['metaTitle'] ?? $storeName,
            'ogDescription' => $seo['ogDescription'] ?? $seo['metaDescription'] ?? 'Curated essentials for conscious modern living.',
            'ogImage' => $ogImage,
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => $seo['ogTitle'] ?? $seo['metaTitle'] ?? $storeName,
            'twitterDescription' => $seo['ogDescription'] ?? $seo['metaDescription'] ?? 'Curated essentials for conscious modern living.',
            'jsonLd' => [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $storeName,
                'url' => $requestRoot.'/',
                'logo' => $general['logoLight'] ? (str_starts_with($general['logoLight'], '/') ? $requestRoot.$general['logoLight'] : url($general['logoLight'])) : null,
                'description' => $seo['metaDescription'] ?? 'Curated essentials for conscious modern living.',
            ],
        ]);
    }
}
