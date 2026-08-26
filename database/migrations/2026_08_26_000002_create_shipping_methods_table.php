<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('shipping_methods')) {
            Schema::create('shipping_methods', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->json('zones')->nullable();
                $table->enum('pricing_type', ['flat_rate', 'free_threshold', 'weight_based'])->default('flat_rate');
                $table->decimal('price', 10, 2)->default(0);
                $table->decimal('free_shipping_min', 10, 2)->nullable();
                $table->decimal('per_kg_rate', 10, 2)->nullable();
                $table->decimal('min_order', 10, 2)->nullable();
                $table->decimal('max_order', 10, 2)->nullable();
                $table->unsignedInteger('delivery_min_days')->default(3);
                $table->unsignedInteger('delivery_max_days')->default(5);
                $table->boolean('active')->default(true);
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        DB::table('shipping_methods')->insertOrIgnore([
            [
                'code' => 'standard', 'name' => 'Complimentary Standard Delivery',
                'description' => 'Reliable tracked delivery for everyday orders.', 'zones' => json_encode(['*']),
                'pricing_type' => 'free_threshold', 'price' => 0, 'free_shipping_min' => 100, 'per_kg_rate' => null,
                'min_order' => null, 'max_order' => null,
                'delivery_min_days' => 3, 'delivery_max_days' => 5, 'active' => true, 'sort_order' => 1,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'code' => 'express', 'name' => 'DHL Express Priority',
                'description' => 'Priority tracked delivery with a shorter delivery window.', 'zones' => json_encode(['*']),
                'pricing_type' => 'flat_rate', 'price' => 15, 'free_shipping_min' => null, 'per_kg_rate' => null,
                'min_order' => null, 'max_order' => null, 'delivery_min_days' => 2, 'delivery_max_days' => 2,
                'active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'code' => 'overnight', 'name' => 'Overnight Next-Morning Dispatch',
                'description' => 'Fastest available dispatch for urgent orders.', 'zones' => json_encode(['*']),
                'pricing_type' => 'flat_rate', 'price' => 25, 'free_shipping_min' => null, 'per_kg_rate' => null,
                'min_order' => null, 'max_order' => null, 'delivery_min_days' => 1, 'delivery_max_days' => 1,
                'active' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
