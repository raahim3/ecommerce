<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique();
            $table->string('page_name');
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('page_views')->insert(collect([
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
        ])->map(fn ($pageName, $pageKey) => [
            'page_key' => $pageKey,
            'page_name' => $pageName,
            'views' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ])->values()->all());
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};