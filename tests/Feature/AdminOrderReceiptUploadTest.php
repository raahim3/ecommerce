<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminOrderReceiptUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_add_a_receipt_to_an_existing_order(): void
    {
        Storage::fake('public');
        $role = Role::create(['name' => 'Administrator', 'slug' => 'admin']);
        $admin = User::factory()->create(['role_id' => $role->id]);
        $order = Order::create([
            'order_number' => 'TEST-'.Str::upper(Str::random(6)),
            'customer_email' => 'customer@example.com',
            'customer_name' => 'Test Customer',
            'shipping_address' => ['address_line1' => 'Test Street'],
            'subtotal' => 20,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'shipping_amount' => 0,
            'total_amount' => 20,
            'status' => 'processing',
            'payment_status' => 'paid',
            'payment_method' => 'bank_transfer',
            'placed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->postJson(
            route('admin.orders.receipt', ['id' => $order->id]),
            ['receipt' => UploadedFile::fake()->image('transfer.png')]
        )->assertOk()->assertJsonPath('success', true);

        $path = 'receipts/'.$response->json('filename');
        Storage::disk('public')->assertExists($path);
        $this->assertSame(Storage::disk('public')->url($path), $response->json('url'));
        $this->assertSame($response->json('url'), $order->fresh()->payment_receipt_url);
    }

    public function test_non_admin_cannot_add_a_receipt_to_an_order(): void
    {
        $order = Order::create([
            'order_number' => 'TEST-'.Str::upper(Str::random(6)),
            'customer_email' => 'customer@example.com',
            'customer_name' => 'Test Customer',
            'shipping_address' => ['address_line1' => 'Test Street'],
            'subtotal' => 20,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'shipping_amount' => 0,
            'total_amount' => 20,
            'status' => 'processing',
            'payment_status' => 'paid',
            'payment_method' => 'bank_transfer',
            'placed_at' => now(),
        ]);

        $this->postJson(route('admin.orders.receipt', ['id' => $order->id]), [
            'receipt' => UploadedFile::fake()->image('transfer.png'),
        ])->assertUnauthorized();
    }
}
