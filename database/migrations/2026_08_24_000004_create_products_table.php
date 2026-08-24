<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(50);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_on_sale')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->json('highlights')->nullable();
            $table->json('specs')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('reviews_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};