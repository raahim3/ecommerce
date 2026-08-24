<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Support\Facades\Artisan;

Route::get('dev-storage-link',function(){
    Artisan::call('storage:link');
    return "Storage link created";
});

Route::get('dev-migrate',function(){
    Artisan::call('migrate');
    return "Migrate created";
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');

    Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])->name('password.email');

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

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product-detail');

Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
Route::post('/api/wishlist/toggle', [WishlistController::class, 'toggle']);
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
Route::post('/api/checkout', [CheckoutController::class, 'store']);

// Address Endpoints
Route::get('/api/addresses', [AddressController::class, 'index'])->middleware('auth');
Route::post('/api/addresses', [AddressController::class, 'store'])->middleware('auth');
Route::post('/api/addresses/{id}/default', [AddressController::class, 'setDefault'])->middleware('auth');
Route::delete('/api/addresses/{id}', [AddressController::class, 'destroy'])->middleware('auth');

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\AccountController;

// Phase 4: Payment
Route::post('/api/payment/intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/api/payment/confirm', [PaymentController::class, 'confirmPayment']);
Route::post('/api/webhooks/stripe', [PaymentController::class, 'handleStripeWebhook']);

// Phase 5: Customer Portal
Route::get('/order-tracking', [OrderTrackingController::class, 'index'])->name('order-tracking');
Route::get('/api/orders/track', [OrderTrackingController::class, 'search']);
Route::get('/invoices/{orderNumber}', [InvoiceController::class, 'show'])->name('invoices.show');
Route::get('/account', [AccountController::class, 'index'])->middleware('auth')->name('account');
Route::post('/api/account/profile', [AccountController::class, 'updateProfile'])->middleware('auth');
Route::post('/api/account/password', [AccountController::class, 'updatePassword'])->middleware('auth');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');
