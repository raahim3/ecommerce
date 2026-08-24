<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'ATELIER10',
                'discount_type' => 'percentage',
                'value' => 10.00,
                'min_spend' => null,
                'max_discount' => 100.00,
                'usage_limit' => 1000,
                'is_active' => true,
            ],
            [
                'code' => 'LUXURY50',
                'discount_type' => 'fixed',
                'value' => 50.00,
                'min_spend' => 300.00,
                'max_discount' => 50.00,
                'usage_limit' => 500,
                'is_active' => true,
            ],
            [
                'code' => 'SUMMER20',
                'discount_type' => 'percentage',
                'value' => 20.00,
                'min_spend' => 150.00,
                'max_discount' => 80.00,
                'usage_limit' => 250,
                'is_active' => true,
            ],
            [
                'code' => 'WELCOME25',
                'discount_type' => 'fixed',
                'value' => 25.00,
                'min_spend' => 100.00,
                'max_discount' => 25.00,
                'usage_limit' => null,
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::firstOrCreate(
                ['code' => $coupon['code']],
                $coupon
            );
        }
    }
}