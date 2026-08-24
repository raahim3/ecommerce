<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
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

        $trendingProducts = Product::active()
            ->with(['category', 'images', 'variants'])
            ->latest()
            ->take(8)
            ->get();

        $flashSaleProducts = Product::active()
            ->onSale()
            ->with(['category', 'images', 'variants'])
            ->take(6)
            ->get();

        $bestSellers = Product::active()
            ->featured()
            ->with(['category', 'images', 'variants'])
            ->take(4)
            ->get();

        $reviews = Review::where('status', 'approved')
            ->with('product')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('Home', [
            'categories' => $categories,
            'trendingProducts' => $trendingProducts,
            'flashSaleProducts' => $flashSaleProducts,
            'bestSellers' => $bestSellers,
            'recentReviews' => $reviews,
        ]);
    }
}