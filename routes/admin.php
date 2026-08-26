<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\CustomersController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\UploadController;
use App\Http\Controllers\Admin\ContactSubmissionController;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/api/broadcasting/auth', [AdminNotificationController::class, 'broadcastAuth'])->name('broadcasting.auth');

    // File Upload API
    Route::post('/api/upload', [UploadController::class, 'upload'])->middleware('throttle:uploads')->name('upload');

    // Notifications
    Route::get('/api/notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/api/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/api/notifications/mark-all-read', [AdminNotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/api/notifications/{id}', [AdminNotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/api/notifications', [AdminNotificationController::class, 'clearAll'])->name('notifications.clear-all');

    // Products
    Route::get('/products', [ProductController::class, 'index'])->name('products');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products/{id}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::patch('/products/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{id}/stock', [ProductController::class, 'updateStock'])->name('products.stock');
    Route::patch('/products/{id}/toggle', [ProductController::class, 'toggleActive'])->name('products.toggle');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::patch('/categories/{id}/toggle', [CategoryController::class, 'toggleActive'])->name('categories.toggle');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory');
    Route::get('/inventory/activities', [InventoryController::class, 'activities'])->name('inventory.activities');
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdateStock'])->name('inventory.bulk-update');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('/orders/{id}/payment', [OrderController::class, 'updatePaymentStatus'])->name('orders.payment');
    Route::post('/orders/{id}/tracking', [OrderController::class, 'addTracking'])->name('orders.tracking');
    Route::post('/orders/{id}/resend-email', [OrderController::class, 'resendEmail'])->name('orders.resend-email');
    Route::get('/orders/{id}/packing-slip', [OrderController::class, 'packingSlip'])->name('orders.packing-slip');
    Route::post('/orders/{id}/notes', [OrderController::class, 'addNote'])->name('orders.notes');
    Route::delete('/orders/{id}', [OrderController::class, 'destroy'])->name('orders.destroy');

    // Reports & Analytics
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports');
    Route::get('/reports/export', [ReportsController::class, 'export'])->name('reports.export');

    // Settings & Coupons
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SettingsController::class, 'saveSettings'])->name('settings.save');
    Route::post('/settings/coupons', [SettingsController::class, 'storeCoupon'])->name('settings.coupons.store');
    Route::patch('/settings/coupons/{id}', [SettingsController::class, 'updateCoupon'])->name('settings.coupons.update');
    Route::patch('/settings/coupons/{id}/toggle', [SettingsController::class, 'toggleCoupon'])->name('settings.coupons.toggle');
    Route::delete('/settings/coupons/{id}', [SettingsController::class, 'destroyCoupon'])->name('settings.coupons.destroy');

    // Customers
    Route::get('/customers', [CustomersController::class, 'index'])->name('customers');
    Route::get('/customers/{id}', [CustomersController::class, 'show'])->name('customers.show');
    Route::get('/contact-submissions', [ContactSubmissionController::class, 'index'])->name('contact-submissions');
    Route::patch('/contact-submissions/{id}', [ContactSubmissionController::class, 'update'])->name('contact-submissions.update');
    Route::delete('/contact-submissions/{id}', [ContactSubmissionController::class, 'destroy'])->name('contact-submissions.destroy');
});