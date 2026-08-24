<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Price alias used by ProductController & product-create UI
            if (!Schema::hasColumn('products', 'original_price')) {
                $table->decimal('original_price', 10, 2)->nullable()->after('price');
            }
            // Primary image URL
            if (!Schema::hasColumn('products', 'image')) {
                $table->string('image')->nullable()->after('compare_at_price');
            }
            // Gallery image URLs (JSON array)
            if (!Schema::hasColumn('products', 'gallery')) {
                $table->json('gallery')->nullable()->after('image');
            }
            // Product metadata fields
            if (!Schema::hasColumn('products', 'material')) {
                $table->string('material')->nullable()->after('gallery');
            }
            if (!Schema::hasColumn('products', 'origin')) {
                $table->string('origin')->nullable()->after('material');
            }
            if (!Schema::hasColumn('products', 'care_instructions')) {
                $table->text('care_instructions')->nullable()->after('origin');
            }
            // Available variant options
            if (!Schema::hasColumn('products', 'available_colors')) {
                $table->json('available_colors')->nullable()->after('care_instructions');
            }
            if (!Schema::hasColumn('products', 'available_sizes')) {
                $table->json('available_sizes')->nullable()->after('available_colors');
            }
            // New arrival flag
            if (!Schema::hasColumn('products', 'is_new')) {
                $table->boolean('is_new')->default(false)->after('is_on_sale');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'original_price', 'image', 'gallery',
                'material', 'origin', 'care_instructions',
                'available_colors', 'available_sizes', 'is_new',
            ]);
        });
    }
};
