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
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        $homepage = Setting::get('homepage', []);
        $trendingIds = collect($homepage['trendingProductIds'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();

        $productRelations = ['category', 'images', 'variants'];
        if (($homepage['trendingMode'] ?? 'automatic') === 'manual' && $trendingIds->isNotEmpty()) {
            $trendingProducts = Product::active()
                ->with($productRelations)
                ->whereIn('id', $trendingIds)
                ->get()
                ->sortBy(fn ($product) => $trendingIds->search($product->id))
                ->values()
                ->take(8);
        } else {
            $trendingSales = DB::table('order_items')
                ->join('orders', function ($join) {
                    $join->on('orders.id', '=', 'order_items.order_id')
                        ->where('orders.payment_status', 'paid');
                })
                ->select(
                    'order_items.product_id',
                    DB::raw('SUM(order_items.quantity) as total_sold')
                )
                ->groupBy('order_items.product_id');

            $trendingProducts = Product::active()
                ->leftJoinSub($trendingSales, 'trending_sales', function ($join) {
                    $join->on('trending_sales.product_id', '=', 'products.id');
                })
                ->select('products.*')
                ->with($productRelations)
                ->orderByDesc(DB::raw('COALESCE(trending_sales.total_sold, 0)'))
                ->orderByDesc('products.created_at')
                ->take(8)
                ->get();
        }

        $flashSaleProducts = Product::active()
            ->onSale()
            ->with(['category', 'images', 'variants'])
            ->take(6)
            ->get();

        $bestSellerCategoryIds = collect($homepage['bestSellerCategoryIds'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();
        $bestSellerCategories = $bestSellerCategoryIds->isNotEmpty()
            ? $categories->filter(fn ($category) => $bestSellerCategoryIds->contains($category->id))->values()
            : $categories;

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

        $bestSellers = Product::active()
            ->leftJoinSub($bestSellerSales, 'best_seller_sales', function ($join) {
                $join->on('best_seller_sales.product_id', '=', 'products.id');
            })
            ->select('products.*')
            ->with(['category', 'images', 'variants'])
            ->orderByDesc(DB::raw('COALESCE(best_seller_sales.total_sold, 0)'))
            ->orderByDesc('products.created_at')
            ->take(20)
            ->get();

        $originalReviews = Review::where('status', 'approved')
            ->with('product')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn ($review) => [
                'id' => $review->id,
                'quote' => $review->comment,
                'name' => $review->author_name,
                'role' => $review->product?->name ?: 'Verified Customer',
            ]);
        $reviews = ($homepage['reviewsMode'] ?? 'original') === 'manual'
            ? collect($homepage['manualReviews'] ?? [])->take(6)->values()
            : $originalReviews;

        $heroProductQuery = Product::active()->with(['category', 'images', 'variants']);
        $heroProduct = !empty($homepage['heroProductId'])
            ? (clone $heroProductQuery)->find($homepage['heroProductId'])
            : null;
        $heroProduct ??= $heroProductQuery->latest()->first();

        $seo = Setting::get('seo', []);
        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? 'Atelier';
        if (($seo['metaTitle'] ?? null)) {
            $seo['metaTitle'] = preg_replace('/^ATELIER\\b/', $storeName, $seo['metaTitle']);
        }
        if (($seo['ogTitle'] ?? null)) {
            $seo['ogTitle'] = preg_replace('/^ATELIER\\b/', $storeName, $seo['ogTitle']);
        }
        $canonicalUrl = route('home');

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
            'ogImage' => $seo['ogImage'] ?? ($general['logoLight'] ?? asset('build/assets/hero.jpg')),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => $seo['ogTitle'] ?? $seo['metaTitle'] ?? $storeName,
            'twitterDescription' => $seo['ogDescription'] ?? $seo['metaDescription'] ?? 'Curated essentials for conscious modern living.',
            'jsonLd' => [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $storeName,
                'url' => url('/'),
                'logo' => $general['logoLight'] ? url($general['logoLight']) : null,
                'description' => $seo['metaDescription'] ?? 'Curated essentials for conscious modern living.',
            ],
        ]);
    }
}