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

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

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
    Route::post('/inventory/bulk-update', [InventoryController::class, 'bulkUpdateStock'])->name('inventory.bulk-update');

    // Orders
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('/orders/{id}/payment', [OrderController::class, 'updatePaymentStatus'])->name('orders.payment');
    Route::post('/orders/{id}/tracking', [OrderController::class, 'addTracking'])->name('orders.tracking');
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
});