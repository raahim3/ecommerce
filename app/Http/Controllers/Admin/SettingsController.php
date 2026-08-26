<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $coupons = Coupon::orderByDesc('created_at')->get();
        $products = Product::active()->orderBy('name')->get(['id', 'name', 'price']);
        $categories = Category::whereNull('parent_id')->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug']);

        $settings = [
            'general' => Setting::get('general', [
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
                'categoriesEyebrow' => 'Shop by category',
                'categoriesTitle' => 'Everything, carefully edited.',
                'categoriesSubtitle' => 'Four departments, one standard of quality.',
                'categoriesActionLabel' => 'View all collections',
                'categoriesActionUrl' => '/shop',
                'selectedCategoryIds' => [],
            ]),
            'navigation' => Setting::get('navigation', [
                'marqueeText' => 'Free shipping on orders over {currency}100 • Easy 30-day returns • Use code ATELIER10 for 10% off',
                'headerMenuItems' => [
                    ['label' => 'Shop All', 'type' => 'page', 'target' => 'shop'],
                    ['label' => 'About', 'type' => 'page', 'target' => 'about'],
                    ['label' => 'Contact', 'type' => 'page', 'target' => 'contact'],
                ],
                'footerDescription' => 'Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.',
                'footerCopyright' => '© {year} {store} All rights reserved.',
                    'footerShopLinks' => [['label' => 'Shop All', 'type' => 'page', 'target' => 'shop']],
                    'footerServiceLinks' => [['label' => 'My Account', 'type' => 'page', 'target' => 'account']],
                    'footerCompanyLinks' => [['label' => 'Our Story', 'type' => 'page', 'target' => 'about']],
            ]),
            'contact' => Setting::get('contact', [
                'eyebrow' => 'Client Services', 'title' => 'How can we assist you?', 'description' => 'Our client care specialists are on hand 7 days a week to answer questions regarding orders, sizing, materials, and styling.',
                'emailTitle' => 'Email Client Care', 'emailDescription' => 'Average reply time: under 2 hours during studio hours.', 'email' => 'care@atelier-studios.com',
                'phoneTitle' => 'Phone Concierge', 'phoneDescription' => 'Monday-Saturday, 9:00 AM - 6:00 PM EST.', 'phone' => '+1 (800) 555-ATELIER', 'messageTitle' => 'Send a Message', 'faqTitle' => 'Frequently Asked Questions', 'faqDescription' => 'Find quick answers to common questions.', 'faqs' => [],
            ]),
            'about' => Setting::get('about', ['eyebrow' => 'The Atelier Manifesto', 'title' => 'Purity in form. Integrity in craft.', 'intro' => 'We exist to counter the culture of disposable trends.', 'image' => '', 'body' => '<h2>Our story</h2><p>We make considered essentials with integrity, quality, and care.</p>', 'storyEyebrow' => 'Where it began', 'storyTitle' => 'A refusal to compromise on materials.', 'storyBody1' => 'Founded in 2021 by a collective of industrial designers and textile purists, Atelier began with a single question: Why should modern luxury be so noisy, fragile, and marked up?', 'storyBody2' => 'We eliminated the traditional retail middlemen, licensing fees, and seasonal fashion calendars.', 'storyStat1Value' => '100%', 'storyStat1Label' => 'Direct-from-maker supply chain', 'storyStat2Value' => 'Zero', 'storyStat2Label' => 'Deadstock inventory landfills', 'standardsEyebrow' => 'Our Standard', 'standardsTitle' => 'Four Unwavering Commitments', 'footprintEyebrow' => 'Global Footprint', 'footprintTitle' => 'Where Our Makers Create', 'footprintDescription' => 'Partnering with generational workshops renowned for specific mastery.', 'ctaTitle' => 'Experience the Atelier difference.', 'ctaDescription' => 'Explore our current collection of audio, timepieces, knitwear, and lifestyle objects.', 'actionLabel' => 'Shop Current Collection', 'actionUrl' => '/shop']),
            'terms' => Setting::get('terms', ['eyebrow' => 'Legal', 'title' => 'Terms of Service', 'intro' => 'The terms that govern your use of Atelier.', 'body' => '<h2>Using our store</h2><p>By using this website, you agree to these terms and our policies.</p>']),
            'privacy' => Setting::get('privacy', ['eyebrow' => 'Legal', 'title' => 'Privacy Policy', 'intro' => 'How Atelier collects and protects your information.', 'body' => '<h2>Your privacy matters</h2><p>We use your information only to provide and improve our services.</p>']),
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
                'trendingEyebrow' => 'Trending now',
                'trendingTitle' => 'Products everyone is talking about.',
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
            'seo' => Setting::get('seo', [
                'metaTitle' => 'ATELIER — Precision-Crafted Modern Essentials',
                'metaDescription' => 'Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods. Designed in Copenhagen and shipped worldwide.',
                'metaKeywords' => 'luxury essentials, cashmere knitwear, studio headphones, leather accessories, Copenhagen design',
                'ogTitle' => 'ATELIER — Modern Essentials',
                'ogDescription' => 'Curated essentials for conscious modern living.',
                'googleAnalyticsId' => '',
                'facebookPixelId' => '',
                'robotsTxt' => "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://atelier-studios.com/sitemap.xml",
            ]),
            'smtp' => Setting::get('smtp', [
                'driver' => 'SMTP',
                'host' => 'smtp.mailtrap.io',
                'port' => '587',
                'encryption' => 'TLS (Port 587)',
                'username' => '',
                'password' => '',
                'fromName' => 'Atelier Studios',
                'fromEmail' => 'noreply@atelier-studios.com',
            ]),
            'payments' => Setting::get('payments', [
                'stripeEnabled' => true,
                'stripePublishable' => '',
                'stripeSecret' => '',
                'paypalEnabled' => true,
                'paypalClientId' => '',
                'paypalSecret' => '',
                'codEnabled' => true,
                'testMode' => true,
            ]),
            'pusher' => Setting::get('pusher', [
                'enabled' => false,
                'key' => '',
                'secret' => '',
                'app_id' => '',
                'cluster' => 'mt1',
            ]),
            'shipping' => Setting::get('shipping', [
                'zones' => [
                    ['id' => 1, 'name' => 'Domestic Free Shipping', 'condition' => 'Orders > $100', 'rate' => 'Free', 'active' => true],
                    ['id' => 2, 'name' => 'Priority Express (US)', 'condition' => 'All US orders', 'rate' => '$15.00', 'active' => true],
                    ['id' => 3, 'name' => 'International Standard', 'condition' => 'All International', 'rate' => '$25.00', 'active' => true],
                ],
                'tax' => ['automated' => true, 'flatRate' => '8.0', 'taxIncluded' => false],
            ]),
        ];

        foreach ([
            ['smtp', 'password'],
            ['payments', 'stripeSecret'],
            ['payments', 'paypalSecret'],
            ['pusher', 'secret'],
        ] as [$group, $key]) {
            if (!empty($settings[$group][$key])) {
                $settings[$group][$key] = '';
            }
        }

        return Inertia::render('Admin/settings', [
            'settings' => $settings,
            'coupons' => $coupons,
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group' => ['required', 'string', 'in:general,homepage,navigation,contact,about,terms,privacy,seo,smtp,payments,shipping,pusher'],
            'data' => ['required', 'array'],
        ]);

        $data = $validated['data'];
        if (in_array($request->group, ['smtp', 'payments', 'pusher'], true)) {
            $existing = Setting::get($request->group, []);
            foreach (['password', 'stripeSecret', 'paypalSecret', 'secret'] as $secretKey) {
                if (array_key_exists($secretKey, $data) && $data[$secretKey] === '' && !empty($existing[$secretKey])) {
                    $data[$secretKey] = $existing[$secretKey];
                }
            }
        }

        Setting::set($request->group, $data);
        $responseSettings = $data;
        foreach (['password', 'stripeSecret', 'paypalSecret', 'secret'] as $secretKey) {
            if (array_key_exists($secretKey, $responseSettings)) {
                $responseSettings[$secretKey] = '';
            }
        }

        return response()->json([
            'success' => true,
            'message' => ucfirst($request->group) . ' settings saved successfully.',
            'settings' => $responseSettings,
        ]);
    }

    public function storeCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper(trim($request->code)),
            'discount_type' => $request->discount_type,
            'value' => $request->value,
            'min_spend' => $request->min_spend ?? 0,
            'max_discount' => $request->max_discount,
            'usage_limit' => $request->usage_limit,
            'expires_at' => $request->expires_at,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json(['success' => true, 'coupon' => $coupon]);
    }

    public function updateCoupon(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code,' . $id],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $coupon->update([
            'code' => strtoupper(trim($request->code)),
            'discount_type' => $request->discount_type,
            'value' => $request->value,
            'min_spend' => $request->min_spend ?? 0,
            'max_discount' => $request->max_discount,
            'usage_limit' => $request->usage_limit,
            'expires_at' => $request->expires_at,
            'is_active' => $request->boolean('is_active', $coupon->is_active),
        ]);

        return response()->json(['success' => true, 'coupon' => $coupon->fresh()]);
    }

    public function toggleCoupon(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => !$coupon->is_active]);

        return response()->json(['success' => true, 'is_active' => $coupon->is_active]);
    }

    public function destroyCoupon(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}