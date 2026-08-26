<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::active()->with(['category', 'images', 'variants']);

        // Search by name or description
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('tagline', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($categorySlug = $request->input('category')) {
            if (strtolower($categorySlug) !== 'all') {
                $query->whereHas('category', function ($q) use ($categorySlug) {
                    $q->where('slug', strtolower($categorySlug))
                      ->orWhere('name', 'like', "%{$categorySlug}%");
                });
            }
        }

        // Sale filter
        if ($request->boolean('sale')) {
            $query->onSale();
        }

        // Featured filter
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Price range filter
        if ($minPrice = $request->input('min_price')) {
            $query->where('price', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->input('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Minimum rating filter
        if ($minRating = $request->input('rating')) {
            $query->where('rating', '>=', (float) $minRating);
        }

        // In-stock filter
        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Sorting
        $sort = $request->input('sort', 'featured');
        match ($sort) {
            'price-asc' => $query->orderBy('price', 'asc'),
            'price-desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderBy('rating', 'desc'),
            'newest' => $query->latest(),
            default => $query->orderBy('is_featured', 'desc')->latest(),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? 'Atelier';
        $canonicalUrl = route('shop');

        return Inertia::render('Shop', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'All'),
                'sort' => $sort,
                'sale' => $request->boolean('sale'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
                'rating' => $request->input('rating'),
                'in_stock' => $request->boolean('in_stock'),
            ],
        ])->withViewData([
            'metaTitle' => 'Shop Curated Essentials | ' . $storeName,
            'metaDescription' => 'Explore ' . $storeName . '\'s curated collection of modern essentials, from precision timepieces and audio to fashion and home goods.',
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => 'Shop Curated Essentials | ' . $storeName,
            'ogDescription' => 'Explore ' . $storeName . '\'s curated collection of modern essentials.',
            'ogImage' => $general['logoLight'] ?? asset('build/assets/hero.jpg'),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => 'Shop Curated Essentials | ' . $storeName,
            'twitterDescription' => 'Explore ' . $storeName . '\'s curated collection of modern essentials.',
        ]);
    }
}