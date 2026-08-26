<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:login')->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

    Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->middleware('throttle:password-reset')->name('password.email');

    Route::get('/reset-password/{token}', [ResetPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [ResetPasswordController::class, 'store'])->name('password.update');
});

Route::post('/logout', [LogoutController::class, 'destroy'])->middleware('auth')->name('logout');

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\NewsletterController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product-detail');

Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle']);
Route::post('/api/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('/api/wishlist/ids', [WishlistController::class, 'getWishlistIds']);

// Cart Endpoints
Route::get('/api/cart', [CartController::class, 'index']);
Route::post('/api/cart/add', [CartController::class, 'add']);
Route::patch('/api/cart/update', [CartController::class, 'update']);
Route::delete('/api/cart/remove/{id}', [CartController::class, 'remove']);
Route::post('/api/cart/sync', [CartController::class, 'sync']);
Route::delete('/api/cart/clear', [CartController::class, 'clear']);

// Coupon Validation Endpoint
Route::post('/api/coupons/validate', [CouponController::class, 'validateCoupon']);

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AddressController;

Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout');
Route::post('/api/checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout');

// Address Endpoints
Route::get('/api/addresses', [AddressController::class, 'index'])->middleware('auth');
Route::post('/api/addresses', [AddressController::class, 'store'])->middleware('auth');
Route::post('/api/addresses/{id}/default', [AddressController::class, 'setDefault'])->middleware('auth');
Route::delete('/api/addresses/{id}', [AddressController::class, 'destroy'])->middleware('auth');

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\ContactController;

// Phase 4: Payment
Route::post('/api/payment/intent', [PaymentController::class, 'createPaymentIntent'])->middleware('throttle:payment');
Route::post('/api/payment/confirm', [PaymentController::class, 'confirmPayment'])->middleware('throttle:payment');
Route::post('/api/payment/paypal/create-order', [PaymentController::class, 'createPayPalOrder'])->middleware('throttle:payment');
Route::post('/api/payment/paypal/capture-order', [PaymentController::class, 'capturePayPalOrder'])->middleware('throttle:payment');
Route::post('/api/webhooks/stripe', [PaymentController::class, 'handleStripeWebhook']);

// Phase 5: Customer Portal
Route::get('/order-tracking', [OrderTrackingController::class, 'index'])->name('order-tracking');
Route::get('/api/orders/track', [OrderTrackingController::class, 'search'])->middleware('throttle:tracking');
Route::get('/invoices/{orderNumber}', [InvoiceController::class, 'show'])->name('invoices.show');
Route::get('/account', [AccountController::class, 'index'])->middleware('auth')->name('account');
Route::post('/api/account/profile', [AccountController::class, 'updateProfile'])->middleware('auth');
Route::post('/api/account/password', [AccountController::class, 'updatePassword'])->middleware('auth');
Route::post('/api/contact/submit', [ContactController::class, 'submit'])->name('contact.submit');

Route::get('/about', function () {
    $general = \App\Models\Setting::get('general', []);
    $storeName = $general['storeName'] ?? 'Atelier';
    $canonicalUrl = route('about');
    return Inertia::render('About', ['pageContent' => \App\Models\Setting::get('about', [])])
        ->withViewData([
            'metaTitle' => 'Our Story | ' . $storeName,
            'metaDescription' => 'Discover ' . $storeName . '\'s approach to considered design, enduring materials and responsible craftsmanship.',
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => 'Our Story | ' . $storeName,
            'ogDescription' => 'Discover ' . $storeName . '\'s approach to considered design, enduring materials and responsible craftsmanship.',
            'ogImage' => $general['logoLight'] ?? asset('build/assets/hero.jpg'),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => 'Our Story | ' . $storeName,
            'twitterDescription' => 'Discover ' . $storeName . '\'s approach to considered design, enduring materials and responsible craftsmanship.',
        ]);
})->name('about');

Route::get('/terms-of-service', function () {
    $general = \App\Models\Setting::get('general', []);
    $storeName = $general['storeName'] ?? 'Atelier';
    $canonicalUrl = route('terms');
    return Inertia::render('LegalPage', ['page' => 'terms'])
        ->withViewData([
            'metaTitle' => 'Terms of Service | ' . $storeName,
            'metaDescription' => 'Read our terms of service and conditions of use.',
            'metaRobots' => 'index,nofollow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => 'Terms of Service | ' . $storeName,
            'ogDescription' => 'Read our terms of service and conditions of use.',
            'ogImage' => $general['logoLight'] ?? asset('build/assets/hero.jpg'),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary',
            'twitterTitle' => 'Terms of Service | ' . $storeName,
            'twitterDescription' => 'Read our terms of service and conditions of use.',
        ]);
})->name('terms');

Route::get('/privacy-policy', function () {
    $general = \App\Models\Setting::get('general', []);
    $storeName = $general['storeName'] ?? 'Atelier';
    $canonicalUrl = route('privacy');
    return Inertia::render('LegalPage', ['page' => 'privacy'])
        ->withViewData([
            'metaTitle' => 'Privacy Policy | ' . $storeName,
            'metaDescription' => 'Read our privacy policy and learn how we protect your data.',
            'metaRobots' => 'index,nofollow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => 'Privacy Policy | ' . $storeName,
            'ogDescription' => 'Read our privacy policy and learn how we protect your data.',
            'ogImage' => $general['logoLight'] ?? asset('build/assets/hero.jpg'),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary',
            'twitterTitle' => 'Privacy Policy | ' . $storeName,
            'twitterDescription' => 'Read our privacy policy and learn how we protect your data.',
        ]);
})->name('privacy');

Route::get('/contact', function () {
    $general = \App\Models\Setting::get('general', []);
    $storeName = $general['storeName'] ?? 'Atelier';
    $canonicalUrl = route('contact');
    return Inertia::render('Contact')
        ->withViewData([
            'metaTitle' => 'Contact ' . $storeName . ' Client Care',
            'metaDescription' => 'Get help with orders, shipping, returns, sizing and product questions from ' . $storeName . ' Client Care.',
            'metaRobots' => 'index,follow',
            'canonicalUrl' => $canonicalUrl,
            'ogType' => 'website',
            'ogTitle' => 'Contact ' . $storeName . ' Client Care',
            'ogDescription' => 'Get help with orders, shipping, returns, sizing and product questions.',
            'ogImage' => $general['logoLight'] ?? asset('build/assets/hero.jpg'),
            'ogUrl' => $canonicalUrl,
            'ogSiteName' => $storeName,
            'twitterCard' => 'summary_large_image',
            'twitterTitle' => 'Contact ' . $storeName . ' Client Care',
            'twitterDescription' => 'Get help with orders, shipping, returns, sizing and product questions.',
        ]);
})->name('contact');

Route::get('/sitemap.xml', function () {
    $urls = collect([
        ['loc' => url('/'), 'changefreq' => 'weekly', 'priority' => '1.0'],
        ['loc' => url('/shop'), 'changefreq' => 'daily', 'priority' => '0.9'],
        ['loc' => url('/about'), 'changefreq' => 'monthly', 'priority' => '0.5'],
        ['loc' => url('/contact'), 'changefreq' => 'monthly', 'priority' => '0.4'],
        ['loc' => url('/terms-of-service'), 'changefreq' => 'monthly', 'priority' => '0.3'],
        ['loc' => url('/privacy-policy'), 'changefreq' => 'monthly', 'priority' => '0.3']
    ])->concat(
        \App\Models\Product::active()->get(['slug', 'updated_at'])->map(fn ($product) => [
            'loc' => url('/product/' . $product->slug),
            'lastmod' => optional($product->updated_at)->toAtomString(),
            'changefreq' => 'weekly',
            'priority' => '0.8',
        ])
    );

    return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml');
})->name('sitemap');
