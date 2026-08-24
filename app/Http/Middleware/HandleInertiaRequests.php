<?php

namespace App\Http\Middleware;

use App\Models\AdminNotification;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

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
        ]);

        // 2. SEO Settings
        $seo = Setting::get('seo', [
            'metaTitle' => 'ATELIER — Precision-Crafted Modern Essentials',
            'metaDescription' => 'Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods. Designed in Copenhagen and shipped worldwide.',
            'metaKeywords' => 'luxury essentials, cashmere knitwear, studio headphones, leather accessories, Copenhagen design',
            'ogTitle' => 'ATELIER — Modern Essentials',
            'ogDescription' => 'Curated essentials for conscious modern living.',
        ]);

        // 3. Public Payment Settings (excluding secret keys)
        $payments = Setting::get('payments', [
            'stripeEnabled' => true,
            'stripePublishable' => '',
            'paypalEnabled' => true,
            'paypalClientId' => '',
            'codEnabled' => true,
            'testMode' => true,
        ]);

        $publicPayments = [
            'stripeEnabled' => (bool) ($payments['stripeEnabled'] ?? true),
            'stripePublishable' => $payments['stripePublishable'] ?? '',
            'paypalEnabled' => (bool) ($payments['paypalEnabled'] ?? true),
            'paypalClientId' => $payments['paypalClientId'] ?? '',
            'codEnabled' => (bool) ($payments['codEnabled'] ?? true),
            'testMode' => (bool) ($payments['testMode'] ?? true),
        ];

        // 4. Admin Notifications (if admin user)
        $adminNotifications = null;
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
                'seo' => $seo,
                'payments' => $publicPayments,
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
