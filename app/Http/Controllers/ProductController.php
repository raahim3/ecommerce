<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
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
            ->with(['category', 'images', 'variants', 'reviews.user'])
            ->firstOrFail();

        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'images', 'variants'])
            ->take(4)
            ->get();

        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? 'Atelier';
        $productImage = $product->images->first()?->image_url ?? $product->image ?? asset('build/assets/hero.jpg');
        $canonicalUrl = route('product-detail', ['slug' => $product->slug]);
        $productDescription = substr($product->description ?? $product->tagline ?? $product->name, 0, 160);

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ])->withViewData([
            'metaTitle' => $product->name . ' | ' . $storeName,
            'metaDescription' => $productDescription,
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'product',
            'ogTitle' => $product->name . ' | ' . $storeName,
            'ogDescription' => $productDescription,
            'ogImage' => url($productImage),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => $product->name . ' | ' . $storeName,
            'twitterDescription' => $productDescription,
        ]);
    }
}