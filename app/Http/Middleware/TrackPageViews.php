<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TrackPageViews
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $route = $request->route();
        $routeName = $route?->getName();

        if (! $request->isMethod('GET') || ! $routeName || $response->getStatusCode() >= 400) {
            return $response;
        }

        if (
            $request->is('admin', 'admin/*', 'api/*')
            || $request->user()?->isAdmin()
            || in_array($routeName, ['robots', 'sitemap'], true)
        ) {
            return $response;
        }

        $pageNames = [
            'home' => 'Home',
            'about' => 'About',
            'contact' => 'Contact',
            'shop' => 'Shop',
            'product-detail' => 'Product Details',
            'wishlist' => 'Wishlist',
            'checkout' => 'Checkout',
            'order-tracking' => 'Order Tracking',
            'terms' => 'Terms of Service',
            'privacy' => 'Privacy Policy',
            'account' => 'My Account',
            'invoices.show' => 'Invoices',
        ];
        $pageName = $pageNames[$routeName] ?? Str::headline(str_replace('.', ' ', $routeName));

        $now = now();
        DB::table('page_views')->upsert(
            [[
                'page_key' => $routeName,
                'page_name' => $pageName,
                'views' => 1,
                'last_viewed_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]],
            ['page_key'],
            [
                'page_name',
                'last_viewed_at',
                'updated_at',
                'views' => DB::raw('page_views.views + 1'),
            ],
        );

        return $response;
    }
}
