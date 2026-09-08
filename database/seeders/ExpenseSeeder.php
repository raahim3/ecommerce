<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        $adminId = $admin ? $admin->id : null;

        $categories = ExpenseCategory::pluck('id', 'slug')->toArray();

        if (empty($categories)) {
            return;
        }

        $now = Carbon::now();

        $demoExpenses = [
            [
                'slug' => 'marketing-ads',
                'title' => 'Meta (Facebook & Instagram) Q3 Retargeting Campaign',
                'amount' => 450.00,
                'expense_date' => $now->copy()->subDays(2)->format('Y-m-d'),
                'payment_method' => 'credit_card',
                'payment_status' => 'paid',
                'vendor_name' => 'Meta Platforms Ireland Ltd',
                'reference_number' => 'INV-FB-2026-9021',
                'notes' => 'Dynamic catalog ads targeting cart abandoners.',
            ],
            [
                'slug' => 'marketing-ads',
                'title' => 'Google Search Ads - Brand Keyword Protection',
                'amount' => 280.50,
                'expense_date' => $now->copy()->subDays(5)->format('Y-m-d'),
                'payment_method' => 'credit_card',
                'payment_status' => 'paid',
                'vendor_name' => 'Google Ireland Ltd',
                'reference_number' => 'GADS-984120',
                'notes' => 'Search ads campaign for brand terms and top category queries.',
            ],
            [
                'slug' => 'shipping-logistics',
                'title' => 'DHL Express Domestic Bulk Courier Manifest',
                'amount' => 340.00,
                'expense_date' => $now->copy()->subDays(4)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'payment_status' => 'paid',
                'vendor_name' => 'DHL Global Forwarding',
                'reference_number' => 'DHL-INV-84192',
                'notes' => 'Prepaid courier credits for express deliveries.',
            ],
            [
                'slug' => 'packaging-materials',
                'title' => 'Custom Matte Black Poly Mailers (2,000 pcs)',
                'amount' => 195.00,
                'expense_date' => $now->copy()->subDays(7)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'payment_status' => 'paid',
                'vendor_name' => 'EcoPack Solutions',
                'reference_number' => 'EP-5510',
                'notes' => 'Eco-friendly biodegradable luxury packaging with embossed logo.',
            ],
            [
                'slug' => 'inventory-cogs',
                'title' => 'Autumn Apparel Collection Batch Procurement',
                'amount' => 1850.00,
                'expense_date' => $now->copy()->subDays(10)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'payment_status' => 'paid',
                'vendor_name' => 'Artisan Textiles Co.',
                'reference_number' => 'AT-PO-2026-08',
                'notes' => 'Raw linen and premium cotton apparel batch for season stock.',
            ],
            [
                'slug' => 'software-subscriptions',
                'title' => 'Vercel / AWS Cloud Hosting & Storage',
                'amount' => 65.00,
                'expense_date' => $now->copy()->subDays(12)->format('Y-m-d'),
                'payment_method' => 'credit_card',
                'payment_status' => 'paid',
                'vendor_name' => 'Amazon Web Services',
                'reference_number' => 'AWS-9912401',
                'notes' => 'S3 media storage and database compute nodes.',
            ],
            [
                'slug' => 'salaries-contractors',
                'title' => 'Freelance Product Photographer & Retoucher',
                'amount' => 400.00,
                'expense_date' => $now->copy()->subDays(14)->format('Y-m-d'),
                'payment_method' => 'paypal',
                'payment_status' => 'paid',
                'vendor_name' => 'Studio Aura Creative',
                'reference_number' => 'PP-ST-8821',
                'notes' => 'Lookbook shoot for 12 new arrivals.',
            ],
            [
                'slug' => 'office-utilities-misc',
                'title' => 'Warehouse Thermal Label Printer Supplies',
                'amount' => 85.00,
                'expense_date' => $now->copy()->subDays(3)->format('Y-m-d'),
                'payment_method' => 'cash',
                'payment_status' => 'paid',
                'vendor_name' => 'Direct Office Express',
                'reference_number' => 'REC-4412',
                'notes' => '6 rolls 4x6 shipping labels & ribbon.',
            ],
            [
                'slug' => 'shipping-logistics',
                'title' => 'FedEx International Overland Freight Bill',
                'amount' => 520.00,
                'expense_date' => $now->copy()->addDays(5)->format('Y-m-d'),
                'payment_method' => 'bank_transfer',
                'payment_status' => 'pending',
                'vendor_name' => 'FedEx Trade Networks',
                'reference_number' => 'FX-PENDING-09',
                'notes' => 'Customs clearance and cross-border freight due upon arrival.',
            ],
            [
                'slug' => 'marketing-ads',
                'title' => 'TikTok Influencer PR Package Sponsoring',
                'amount' => 300.00,
                'expense_date' => $now->copy()->addDays(8)->format('Y-m-d'),
                'payment_method' => 'paypal',
                'payment_status' => 'pending',
                'vendor_name' => 'CollabMedia Agency',
                'reference_number' => 'PR-SEPT-11',
                'notes' => 'Deposit paid; remaining balance payable on video publication.',
            ],
        ];

        foreach ($demoExpenses as $item) {
            $catId = $categories[$item['slug']] ?? array_values($categories)[0];
            unset($item['slug']);
            $item['expense_category_id'] = $catId;
            $item['user_id'] = $adminId;
            $item['currency'] = 'USD';
            $item['created_at'] = $now;
            $item['updated_at'] = $now;

            Expense::create($item);
        }
    }
}
