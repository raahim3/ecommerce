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
            ->withCount('reviews')
            ->firstOrFail();

        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'images', 'variants'])
            ->withCount('reviews')
            ->take(4)
            ->get();

        $general = Setting::get('general', []);
        $storeName = $general['storeName'] ?? '';
        $requestRoot = rtrim(request()->root(), '/');
        $productImage = $product->images->first()?->image_url ?? $product->image ?? asset('build/assets/hero.jpg');
        $canonicalPath = route('product-detail', ['slug' => $product->slug], false);
        $canonicalUrl = $requestRoot . $canonicalPath;
        $productDescription = substr($product->description ?? $product->tagline ?? $product->name, 0, 160);
        $metaTitle = $product->seo_title ?: ($product->name . ' | ' . $storeName);
        $metaDescription = $product->seo_description ?: $productDescription;
        $metaKeywords = $product->seo_keywords ?? '';
        $ogImage = filter_var($productImage, FILTER_VALIDATE_URL)
            ? $productImage
            : (str_starts_with($productImage, '//') ? 'https:' . $productImage : (str_starts_with($productImage, '/') ? $requestRoot . $productImage : url($productImage)));
        $ogImage = filter_var($ogImage, FILTER_VALIDATE_URL) ? $ogImage : asset('build/assets/hero.jpg');

        return Inertia::render('ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
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
}