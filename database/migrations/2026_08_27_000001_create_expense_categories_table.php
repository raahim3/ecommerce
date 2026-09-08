<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('color', 20)->default('#6366F1'); // Hex code for badges
            $table->text('description')->nullable();
            $table->decimal('monthly_budget', 12, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed initial standard eCommerce expense categories
        $now = now();
        $categories = [
            [
                'name' => 'Marketing & Ads',
                'slug' => 'marketing-ads',
                'color' => '#8B5CF6', // Violet
                'description' => 'Meta Ads, Google Ads, TikTok Ads, Influencers & promotions',
                'monthly_budget' => 1500.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Shipping & Logistics',
                'slug' => 'shipping-logistics',
                'color' => '#3B82F6', // Blue
                'description' => 'Courier services, freight, delivery charges, customs & handling',
                'monthly_budget' => 800.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Packaging Materials',
                'slug' => 'packaging-materials',
                'color' => '#F59E0B', // Amber
                'description' => 'Boxes, poly mailers, bubble wrap, custom stickers, ribbons',
                'monthly_budget' => 400.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Inventory & Cost of Goods',
                'slug' => 'inventory-cogs',
                'color' => '#10B981', // Emerald
                'description' => 'Raw materials, product procurement, bulk stock purchases',
                'monthly_budget' => 4000.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Software & Subscriptions',
                'slug' => 'software-subscriptions',
                'color' => '#06B6D4', // Cyan
                'description' => 'Hosting, domain, Shopify/Laravel tools, email marketing, SaaS',
                'monthly_budget' => 250.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Salaries & Contractors',
                'slug' => 'salaries-contractors',
                'color' => '#EC4899', // Pink
                'description' => 'Staff payroll, freelance developers, designers & assistants',
                'monthly_budget' => 2000.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Office, Utilities & Misc',
                'slug' => 'office-utilities-misc',
                'color' => '#64748B', // Slate
                'description' => 'Rent, electricity, internet, office supplies, bank & payment fees',
                'monthly_budget' => 600.00,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('expense_categories')->insert($categories);
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_categories');
    }
};
