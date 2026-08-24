<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
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

        $settings = [
            'general' => Setting::get('general', [
                'storeName' => 'Atelier Studios Inc.',
                'supportEmail' => 'care@atelier-studios.com',
                'phone' => '+1 (800) 555-ATELIER',
                'currency' => 'USD — US Dollar',
                'timezone' => 'UTC-5 (Eastern Standard)',
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
                'stripePublishable' => '',
                'stripeSecret' => '',
                'paypalClientId' => '',
                'paypalSecret' => '',
                'codEnabled' => true,
                'testMode' => true,
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

        return Inertia::render('Admin/settings', [
            'settings' => $settings,
            'coupons' => $coupons,
        ]);
    }

    public function saveSettings(Request $request): JsonResponse
    {
        $request->validate([
            'group' => ['required', 'string', 'in:general,seo,smtp,payments,shipping'],
            'data' => ['required', 'array'],
        ]);

        Setting::set($request->group, $request->data);

        return response()->json([
            'success' => true,
            'message' => ucfirst($request->group) . ' settings saved successfully.',
            'settings' => Setting::get($request->group),
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

        return response()->json(['success' => true, 'coupon' => $coupon]);
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