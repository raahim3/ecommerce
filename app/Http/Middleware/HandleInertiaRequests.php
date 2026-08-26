<?php

namespace App\Http\Middleware;

use App\Models\AdminNotification;
use App\Models\Setting;
use App\Models\Category;
use App\Services\CurrencyService;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Schema;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->isAdmin();

        // 1. General Branding
        $general = Setting::get('general', [
            'storeName' => 'Atelier Studios Inc.',
            'tagline' => 'Precision-Crafted Modern Essentials',
            'supportEmail' => 'care@atelier-studios.com',
            'phone' => '+1 (800) 555-ATELIER',
            'currency' => 'USD — US Dollar',
            'timezone' => 'UTC-5 (Eastern Standard)',
            'logoLight' => '',
            'logoDark' => '',
            'favicon' => '',
            'heroEyebrow' => 'New Season / 2026 Collection',
            'heroTitle' => "Discover\nWhat's\nNext.",
            'heroDescription' => 'Curated essentials designed for modern living — made in small runs, built to outlast the season.',
            'heroPrimaryLabel' => 'Shop Collection',
            'heroPrimaryUrl' => '/shop',
            'heroSecondaryLabel' => 'Explore New Arrivals',
            'heroSecondaryUrl' => '/shop?sort=newest',
            'heroImage' => '',
            'heroImageAlt' => 'Model wearing an off-white oversized wool coat against a soft concrete wall',
            'heroEditorEyebrow' => "Editor's pick",
            'heroEditorTitle' => 'Wool Overcoat — Bone',
            'heroEditorPrice' => '420',
            'heroEditorStatus' => 'In stock',
            'heroBadge' => 'Just dropped',
        ]);

        // 2. SEO Settings
        $seo = Setting::get('seo', [
            'metaTitle' => 'ATELIER — Precision-Crafted Modern Essentials',
            'metaDescription' => 'Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods. Designed in Copenhagen and shipped worldwide.',
            'metaKeywords' => 'luxury essentials, cashmere knitwear, studio headphones, leather accessories, Copenhagen design',
            'ogTitle' => 'ATELIER — Modern Essentials',
            'ogDescription' => 'Curated essentials for conscious modern living.',
        ]);
        if (($general['storeName'] ?? null) && ($seo['metaTitle'] ?? null)) {
            $seo['metaTitle'] = preg_replace('/^ATELIER\\b/', $general['storeName'], $seo['metaTitle']);
        }
        if (($general['storeName'] ?? null) && ($seo['ogTitle'] ?? null)) {
            $seo['ogTitle'] = preg_replace('/^ATELIER\\b/', $general['storeName'], $seo['ogTitle']);
        }

        // 3. Public Payment Settings (excluding secret keys)
        $payments = Setting::get('payments', [
            'stripeEnabled' => true,
            'stripePublishable' => '',
            'paypalEnabled' => true,
            'paypalClientId' => '',
            'codEnabled' => true,
            'testMode' => true,
        ]);
        $navigation = Setting::get('navigation', [
            'marqueeText' => 'Free shipping on orders over {currency}100 • Easy 30-day returns • Use code ATELIER10 for 10% off',
            'headerMenuItems' => [
                ['label' => 'Shop All', 'type' => 'page', 'target' => 'shop'],
                ['label' => 'About', 'type' => 'page', 'target' => 'about'],
                ['label' => 'Contact', 'type' => 'page', 'target' => 'contact'],
            ],
            'footerDescription' => 'Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.',
            'footerCopyright' => '© {year} {store} All rights reserved.',
            'footerShopLinks' => [], 'footerServiceLinks' => [], 'footerCompanyLinks' => [],
        ]);

        $publicPayments = [
            'stripeEnabled' => (bool) ($payments['stripeEnabled'] ?? true),
            'stripePublishable' => $payments['stripePublishable'] ?? '',
            'paypalEnabled' => (bool) ($payments['paypalEnabled'] ?? true),
            'paypalClientId' => !empty($payments['paypalClientId'])
                ? $payments['paypalClientId']
                : config('services.paypal.client_id'),
            'codEnabled' => (bool) ($payments['codEnabled'] ?? true),
            'testMode' => (bool) ($payments['testMode'] ?? true),
        ];
        $shippingMethods = Schema::hasTable('shipping_methods')
            ? ShippingMethod::active()->get(['id', 'code', 'name', 'description', 'pricing_type', 'price', 'free_shipping_min', 'per_kg_rate', 'delivery_min_days', 'delivery_max_days'])
            : collect();
        $shippingSettings = Setting::get('shipping', [
            'zones' => [['condition' => 'Orders > $100', 'rate' => 'Free'], ['rate' => '$15.00']],
            'tax' => ['flatRate' => '8.0', 'taxIncluded' => false],
        ]);
        $freeShippingThreshold = 100;
        $standardShippingRate = 15;
        $paidShippingRates = [];
        foreach ($shippingSettings['zones'] ?? [] as $zone) {
            if (isset($zone['active']) && !$zone['active']) continue;
            if (strtolower(trim($zone['rate'] ?? '')) === 'free' && preg_match('/\$(\d+(?:\.\d+)?)/', $zone['condition'] ?? '', $match)) {
                $freeShippingThreshold = (float) $match[1];
            } elseif (preg_match('/\$(\d+(?:\.\d+)?)/', $zone['rate'] ?? '', $match)) {
                $paidShippingRates[] = (float) $match[1];
            }
        }
        if ($paidShippingRates) $standardShippingRate = $paidShippingRates[0];
        $overnightShippingRate = $paidShippingRates[1] ?? 25;

        // 4. Admin Notifications (if admin user)
        $adminNotifications = null;
        $realtime = array_merge([
            'enabled' => (bool) env('PUSHER_ENABLED', false),
            'key' => env('PUSHER_APP_KEY', ''),
            'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
        ], Setting::get('pusher', []));
        if (empty($realtime['key'])) $realtime['key'] = env('PUSHER_APP_KEY', '');
        $realtime['enabled'] = (bool) $realtime['enabled'] || ($realtime['key'] && env('PUSHER_APP_SECRET') && env('PUSHER_APP_ID'));
        if ($isAdmin) {
            $adminNotifications = [
                'unread_count' => AdminNotification::unread()->count(),
                'recent' => AdminNotification::recent()->limit(10)->get(),
            ];
        }

        return [
            ...parent::share($request),
            'app_settings' => [
                'general' => $general,
                'realtime' => [
                    'enabled' => (bool) ($realtime['enabled'] ?? false),
                    'key' => $realtime['key'] ?? '',
                    'cluster' => $realtime['cluster'] ?? 'mt1',
                ],
                    'currencySymbol' => CurrencyService::symbol($general['currency'] ?? null),
                'homepage' => Setting::get('homepage', [
                    'heroEyebrow' => 'New Season / 2026 Collection',
                    'heroTitle' => "Discover\nWhat's\nNext.",
                    'heroDescription' => 'Curated essentials designed for modern living — made in small runs, built to outlast the season.',
                    'heroPrimaryLabel' => 'Shop Collection',
                    'heroPrimaryUrl' => '/shop',
                    'heroSecondaryLabel' => 'Explore New Arrivals',
                    'heroSecondaryUrl' => '/shop?sort=newest',
                    'heroImage' => '',
                    'heroImageAlt' => 'Model wearing an off-white oversized wool coat against a soft concrete wall',
                    'heroProductId' => null,
                    'heroBadge' => 'Just dropped',
                    'categoriesEyebrow' => 'Shop by category',
                    'categoriesTitle' => 'Everything, carefully edited.',
                    'categoriesSubtitle' => 'Four departments, one standard of quality.',
                    'categoriesActionLabel' => 'View all collections',
                    'categoriesActionUrl' => '/shop',
                    'selectedCategoryIds' => [],
                        'trendingEyebrow' => 'Trending now',
                        'trendingTitle' => 'Products everyone are talking about.',
                        'trendingSubtitle' => '',
                        'trendingActionLabel' => 'View all products',
                        'trendingActionUrl' => '/shop',
                        'trendingMode' => 'automatic',
                        'trendingProductIds' => [],
                        'flashSaleEyebrow' => 'Up to 40% off',
                        'flashSaleTitle' => "The Essentials\nSale",
                        'flashSaleDescription' => 'Two days only. Our most-loved pieces, marked down across every department.',
                        'flashSaleActionLabel' => 'Shop the sale',
                        'flashSaleActionUrl' => '/shop?sale=true',
                        'flashSaleImage' => '',
                        'flashSaleDurationHours' => 48,
                        'bestSellerEyebrow' => 'Customer favorites',
                        'bestSellerTitle' => 'The pieces that keep selling out.',
                        'bestSellerSubtitle' => '',
                        'bestSellerCategoryIds' => [],
                        'editorialEyebrow' => 'Our philosophy',
                        'editorialTitle' => 'More than just shopping.',
                        'editorialDescription' => 'Thoughtfully selected products. Exceptional quality. Designed for the way you live — and made by people we know by name.',
                        'editorialImage' => '',
                        'editorialImageAlt' => 'A calm minimal living room with a linen sofa and warm daylight',
                        'editorialStat1Value' => '120+',
                        'editorialStat1Label' => 'Makers',
                        'editorialStat2Value' => '18',
                        'editorialStat2Label' => 'Countries',
                        'editorialStat3Value' => '94%',
                        'editorialStat3Label' => 'Repeat buyers',
                        'editorialActionLabel' => 'Our story',
                        'editorialActionUrl' => '/about',
                        'reviewsEyebrow' => 'Loved by thousands',
                        'reviewsTitle' => 'Reviews that keep us honest.',
                        'reviewsMode' => 'original',
                        'manualReviews' => [],
                        'newsletterEyebrow' => 'Stay in the loop',
                        'newsletterTitle' => 'First access to every drop.',
                        'newsletterDescription' => 'Get first access to new drops, exclusive offers and curated collections. No noise, one email a week.',
                        'newsletterPlaceholder' => 'Enter your email',
                        'newsletterButtonLabel' => 'Subscribe',
                        'socialEyebrow' => 'Follow the journey',
                        'socialTitle' => '@atelier',
                        'socialGalleryImages' => [],
                ]),
                'navigation' => Setting::get('navigation', [
                    'marqueeText' => 'Free shipping on orders over {currency}100 • Easy 30-day returns • Use code ATELIER10 for 10% off',
                    'headerMenuItems' => [],
                    'footerDescription' => 'Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.',
                    'footerCopyright' => '© {year} {store} All rights reserved.',
                    'footerShopLinks' => [],
                    'footerServiceLinks' => [],
                        'footerShopLinks' => [['label' => 'Shop All', 'type' => 'page', 'target' => 'shop']],
                        'footerServiceLinks' => [['label' => 'My Account', 'type' => 'page', 'target' => 'account']],
                        'footerCompanyLinks' => [['label' => 'Our Story', 'type' => 'page', 'target' => 'about']],
                ]),
                'legal' => [
                    'terms' => Setting::get('terms', []),
                    'privacy' => Setting::get('privacy', []),
                ],
                'navigationCategories' => Category::active()->whereNull('parent_id')->orderBy('sort_order')->get(['id', 'name', 'slug']),
                'seo' => $seo,
                'contact' => Setting::get('contact', [
                    'eyebrow' => 'Client Services',
                    'title' => 'How can we assist you?',
                    'description' => 'Our client care specialists are on hand 7 days a week to answer questions regarding orders, sizing, materials, and styling.',
                    'emailTitle' => 'Email Client Care', 'emailDescription' => 'Average reply time: under 2 hours during studio hours.', 'email' => 'care@atelier-studios.com',
                    'phoneTitle' => 'Phone Concierge', 'phoneDescription' => 'Monday-Saturday, 9:00 AM - 6:00 PM EST.', 'phone' => '+1 (800) 555-ATELIER',
                    'messageTitle' => 'Send a Message', 'faqTitle' => 'Frequently Asked Questions', 'faqDescription' => 'Find quick answers to common questions.',
                    'faqs' => [],
                ]),
                'about' => Setting::get('about', []),
                'payments' => $publicPayments,
                'checkout' => [
                    'taxRate' => (float) ($shippingSettings['tax']['flatRate'] ?? 8),
                    'taxIncluded' => (bool) ($shippingSettings['tax']['taxIncluded'] ?? false),
                    'freeShippingThreshold' => $freeShippingThreshold,
                    'shippingRate' => $standardShippingRate,
                    'overnightShippingRate' => $overnightShippingRate,
                    'shippingMethods' => $shippingMethods,
                ],
            ],
            'admin_notifications' => $adminNotifications,
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => is_object($user->role) ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                        'slug' => $user->role->slug,
                    ] : null,
                    'is_admin' => $isAdmin,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
