<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Setting;
use App\Models\ShippingMethod;
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
        $categories = Category::where('is_active', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'parent_id']);

        $settings = [
            'general' => Setting::get('general', [
                'storeName' => 'Atelier Studios Inc.',
                'tagline' => 'Precision-Crafted Modern Essentials',
                'supportEmail' => 'care@atelier-studios.com',
                'phone' => '+1 (800) 555-ATELIER',
                'currency' => 'USD — US Dollar',
                'timezone' => 'UTC-5 (Eastern Standard)',
                'orderPrefix' => 'ATL',
                'storeCountries' => ['Pakistan'],
                'logoLight' => '',
                'logoDark' => '',
                'favicon' => '',
                'tinymceApiKey' => '',
                'heroEyebrow' => 'New Season / 2026 Collection',
                'heroTitle' => "Discover\nWhat's\nNext.",
                'heroDescription' => 'Curated essentials designed for modern living — made in small runs, built to outlast the season.',
                'heroPrimaryLabel' => 'Shop Collection',
                'heroPrimaryUrl' => '/shop',
                'heroSecondaryLabel' => 'Explore New Arrivals',
                'heroSecondaryUrl' => '/shop?sort=newest',
                'heroImage' => '',
                'heroImageAlt' => 'Model wearing an off-white oversized wool coat against a soft concrete wall',
                'heroEnabled' => true,
                'categoriesEnabled' => true,
                'trendingEnabled' => true,
                'flashSaleEnabled' => true,
                'bestSellerEnabled' => true,
                'editorialEnabled' => true,
                'reviewsEnabled' => true,
                'newsletterEnabled' => true,
                'socialGalleryEnabled' => true,
                'benefitsEnabled' => true,
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
                'phoneTitle' => 'Phone Concierge', 'phoneDescription' => 'Monday-Saturday, 9:00 AM - 6:00 PM EST.', 'phone' => '+1 (800) 555-ATELIER',
                'chatTitle' => 'Live Stylist Chat', 'chatDescription' => 'Instant guidance on garment sizing and curated pairings.', 'chatButtonLabel' => 'Start Live Chat Session →',
                'messageTitle' => 'Send a Message', 'faqTitle' => 'Frequently Asked Questions', 'faqDescription' => 'Find quick answers to common questions.', 'faqs' => [],
                'metaTitle' => 'Contact Atelier Client Care',
                'metaDescription' => 'Get help with orders, shipping, returns, sizing and product questions from Atelier Client Care.',
                'metaKeywords' => 'contact support, customer care, order help, shipping support, product sizing, Atelier',
            ]),
            'about' => Setting::get('about', ['eyebrow' => 'The Atelier Manifesto', 'title' => 'Purity in form. Integrity in craft.', 'intro' => 'We exist to counter the culture of disposable trends.', 'image' => '', 'imageAlt' => 'Atelier workspace and design sketches', 'body' => '<h2>Our story</h2><p>We make considered essentials with integrity, quality, and care.</p>', 'metaTitle' => 'Our Story | Atelier', 'metaDescription' => 'Discover Atelier\'s approach to considered design, enduring materials and responsible craftsmanship.', 'metaKeywords' => 'about atelier, our story, craftsmanship, considered design, responsible materials', 'storyEyebrow' => 'Where it began', 'storyTitle' => 'A refusal to compromise on materials.', 'storyBody1' => 'Founded in 2021 by a collective of industrial designers and textile purists, Atelier began with a single question: Why should modern luxury be so noisy, fragile, and marked up?', 'storyBody2' => 'We eliminated the traditional retail middlemen, licensing fees, and seasonal fashion calendars. By producing in controlled, limited runs with master makers across Italy, France, Japan, and Portugal, we deliver uncompromising grade-A quality directly to your doorstep.', 'storyStat1Value' => '100%', 'storyStat1Label' => 'Direct-from-maker supply chain', 'storyStat2Value' => 'Zero', 'storyStat2Label' => 'Deadstock inventory landfills', 'standardsEyebrow' => 'Our Standard', 'standardsTitle' => 'Four Unwavering Commitments', 'standards1Title' => 'Material Sourcing', 'standards1Description' => 'Certified Grade-A Mongolian cashmere, Tuscan vegetable-tanned leather, and Japanese beta-titanium wireframes.', 'standards2Title' => 'Small-Batch Runs', 'standards2Description' => 'Manufactured strictly to demand. We produce fewer items with obsessive attention to stitching and tolerances.', 'standards3Title' => 'Eco Packaging', 'standards3Description' => 'Every order arrives in 100% recycled unbleached kraft boxes printed exclusively with biodegradable soy inks.', 'standards4Title' => '2-Year Warranty', 'standards4Description' => 'We stand behind every item we create with an unconditional two-year repair or replacement guarantee.', 'footprintEyebrow' => 'Global Footprint', 'footprintTitle' => 'Where Our Makers Create', 'footprintDescription' => 'Partnering with generational workshops renowned for specific mastery.', 'footprint1Label' => 'Biella, Italy', 'footprint1Title' => 'Cashmere & Knitwear', 'footprint1Description' => 'Spun in family-run mills operating along the pristine alpine waters of Piedmont since 1948.', 'footprint2Label' => 'Kyoto, Japan', 'footprint2Title' => 'Ceramics & Diffusers', 'footprint2Description' => 'Hand-thrown organic stoneware ceramics and Hinoki wood oil distillations by master artisans.', 'footprint3Label' => 'Porto, Portugal', 'footprint3Title' => 'Footwear & Leather', 'footprint3Description' => 'Constructed on natural Margom rubber cup soles with double-stitched vegetable calfskins.', 'footprint4Label' => 'Geneva, Switzerland', 'footprint4Title' => 'Horology & Crystals', 'footprint4Description' => 'Swiss quartz movement assembly and anti-reflective domed sapphire crystal fabrication.', 'ctaTitle' => 'Experience the Atelier difference.', 'ctaDescription' => 'Explore our current collection of audio, timepieces, knitwear, and lifestyle objects.', 'actionLabel' => 'Shop Current Collection', 'actionUrl' => '/shop']),
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
                'heroEnabled' => true,
                'categoriesEnabled' => true,
                'trendingEnabled' => true,
                'flashSaleEnabled' => true,
                'bestSellerEnabled' => true,
                'editorialEnabled' => true,
                'reviewsEnabled' => true,
                'newsletterEnabled' => true,
                'socialGalleryEnabled' => true,
                'benefitsEnabled' => true,
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
                'editorialStat1Value' => '',
                'editorialStat1Label' => 'Makers',
                'editorialStat2Value' => '',
                'editorialStat2Label' => 'Countries',
                'editorialStat3Value' => '',
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
                'bankTransferEnabled' => false,
                'bankName' => '',
                'bankAccountTitle' => '',
                'bankAccountNumber' => '',
                'bankIban' => '',
                'bankSwift' => '',
                'bankInstructions' => 'Please transfer the exact total amount to our bank account. Include your Order Number in the payment reference. Upload your payment screenshot or transfer receipt below.',
                'testMode' => true,
            ]),
            'pusher' => Setting::get('pusher', [
                'enabled' => false,
                'key' => '',
                'secret' => '',
                'app_id' => '',
                'cluster' => 'mt1',
            ]),
            'shipping' => (function () {
                $shippingDefaults = [
                    'freeShippingThresholdEnabled' => true,
                    'freeShippingThreshold' => 100,
                    'zones' => [
                        ['id' => 1, 'name' => 'Domestic Free Shipping', 'condition' => 'Orders > $100', 'rate' => 'Free', 'active' => true],
                        ['id' => 2, 'name' => 'Priority Express (US)', 'condition' => 'All US orders', 'rate' => '$15.00', 'active' => true],
                        ['id' => 3, 'name' => 'International Standard', 'condition' => 'All International', 'rate' => '$25.00', 'active' => true],
                    ],
                    'tax' => ['automated' => true, 'flatRate' => '8.0', 'taxIncluded' => false],
                ];
                $current = Setting::get('shipping', $shippingDefaults);
                if (!isset($current['freeShippingThresholdEnabled'])) {
                    $freeMethod = ShippingMethod::where('pricing_type', 'free_threshold')->first();
                    $current['freeShippingThresholdEnabled'] = $freeMethod ? (bool) $freeMethod->active : true;
                    $current['freeShippingThreshold'] = $freeMethod && $freeMethod->free_shipping_min !== null
                        ? (float) $freeMethod->free_shipping_min
                        : 100;
                }
                return $current;
            })(),
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

        if (empty($settings['general']['storeCountries']) || !is_array($settings['general']['storeCountries'])) {
            $settings['general']['storeCountries'] = ['Pakistan'];
        }

        $allCountries = \App\Models\Country::orderBy('name')->get(['id', 'name', 'iso2', 'emoji']);

        return Inertia::render('Admin/settings', [
            'settings' => $settings,
            'allCountries' => $allCountries,
            'shippingMethods' => ShippingMethod::orderBy('sort_order')->orderBy('name')->get(),
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

        // Sync with shipping_methods table if saving shipping settings
        if ($request->group === 'shipping') {
            $threshold = isset($data['freeShippingThreshold']) ? (float) $data['freeShippingThreshold'] : null;
            $enabled = isset($data['freeShippingThresholdEnabled']) ? (bool) $data['freeShippingThresholdEnabled'] : null;

            $methods = ShippingMethod::where('pricing_type', 'free_threshold')
                ->orWhere('code', 'standard')
                ->get();

            foreach ($methods as $m) {
                if ($threshold !== null) {
                    $m->free_shipping_min = $threshold;
                }
                if ($enabled !== null && $m->pricing_type === 'free_threshold') {
                    $m->active = $enabled;
                }
                $m->save();
            }
        }

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