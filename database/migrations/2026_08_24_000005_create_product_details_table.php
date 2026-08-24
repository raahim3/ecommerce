<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('image_url');
            $table->string('alt_text')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('color_name')->nullable();
            $table->string('color_hex')->nullable();
            $table->string('size')->nullable();
            $table->string('sku')->nullable();
            $table->decimal('additional_price', 10, 2)->default(0.00);
            $table->integer('stock_quantity')->default(25);
            $table->string('image_url')->nullable();
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('author_name');
            $table->integer('rating')->default(5);
            $table->string('title')->nullable();
            $table->text('comment');
            $table->boolean('is_verified_buyer')->default(true);
            $table->string('status')->default('approved'); // approved, pending, rejected
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
    }
};