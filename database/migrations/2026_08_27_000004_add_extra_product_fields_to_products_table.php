<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'subcategory_id')) {
                $table->foreignId('subcategory_id')->nullable()->after('category_id')->constrained('categories')->nullOnDelete();
            }
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable()->after('tagline');
            }
            if (!Schema::hasColumn('products', 'cost_per_item')) {
                $table->decimal('cost_per_item', 10, 2)->nullable()->after('compare_at_price');
            }
            if (!Schema::hasColumn('products', 'seo_title')) {
                $table->string('seo_title')->nullable()->after('reviews_count');
            }
            if (!Schema::hasColumn('products', 'seo_description')) {
                $table->text('seo_description')->nullable()->after('seo_title');
            }
            if (!Schema::hasColumn('products', 'seo_keywords')) {
                $table->text('seo_keywords')->nullable()->after('seo_description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['subcategory_id']);
            $table->dropColumn([
                'subcategory_id',
                'brand',
                'cost_per_item',
                'seo_title',
                'seo_description',
                'seo_keywords',
            ]);
        });
    }
};
