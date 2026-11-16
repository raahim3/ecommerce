<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderReviewLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_delivered_order_link_shows_order_summary_without_private_details(): void
    {
        [$order] = $this->createOrder();

        $this->get(route('order-review.show', ['token' => $order->review_token]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('OrderReview')
                ->where('order.order_number', $order->order_number)
                ->where('order.total', 24.5)
                ->where('items.0.name', 'Test Product')
                ->where('reviewProducts.0.reviewed', false)
                ->missing('order.customer_email')
                ->missing('order.shipping_address')
            );
    }

    public function test_link_allows_one_review_without_login_and_hides_form_after_submission(): void
    {
        [$order, $product] = $this->createOrder();
        Storage::fake('public');
        $reviewUrl = route('order-review.reviews.store', ['token' => $order->review_token]);
        $reviewData = [
            'product_id' => $product->id,
            'rating' => 5,
            'title' => 'Great product',
            'comment' => 'Exactly as described.',
            'attachments' => [UploadedFile::fake()->image('review.jpg')],
        ];

        $this->postJson($reviewUrl, $reviewData)->assertCreated();

        $this->assertDatabaseHas('reviews', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'user_id' => null,
            'author_name' => 'Test Customer',
            'status' => 'pending',
        ]);

        $review = Review::where('order_id', $order->id)->firstOrFail();
        $this->assertCount(1, $review->attachments);
        $this->assertStringEndsWith('.webp', $review->attachments[0]);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $review->attachments[0]));

        $this->postJson($reviewUrl, $reviewData)->assertConflict();

        $this->get(route('order-review.show', ['token' => $order->review_token]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('reviewProducts.0.reviewed', true)
            );
    }

    public function test_order_review_link_is_unavailable_until_delivery(): void
    {
        [$order, $product] = $this->createOrder('shipped');

        $this->get(route('order-review.show', ['token' => $order->review_token]))
            ->assertNotFound();

        $this->postJson(route('order-review.reviews.store', ['token' => $order->review_token]), [
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'Review before delivery.',
        ])->assertNotFound();
    }

    public function test_admin_can_copy_a_review_link_only_after_delivery(): void
    {
        [$order] = $this->createOrder();
        $adminRole = Role::create(['name' => 'Administrator', 'slug' => 'admin']);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $response = $this->actingAs($admin)
            ->postJson(route('admin.orders.review-link', ['id' => $order->id]))
            ->assertOk();

        $token = $order->fresh()->review_token;
        $this->assertSame(64, strlen($token));
        $response->assertJsonPath('url', route('order-review.show', ['token' => $token]));

        [$undeliveredOrder] = $this->createOrder('shipped');
        $this->postJson(route('admin.orders.review-link', ['id' => $undeliveredOrder->id]))
            ->assertUnprocessable();
    }

    private function createOrder(string $status = 'delivered'): array
    {
        $suffix = Str::lower(Str::random(6));
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category-'.$suffix,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product-'.$suffix,
            'price' => 20,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_number' => 'TEST-'.Str::upper(Str::random(6)),
            'review_token' => Str::random(64),
            'customer_email' => 'customer@example.com',
            'customer_name' => 'Test Customer',
            'customer_phone' => '+1 555 0100',
            'shipping_address' => ['address_line1' => 'Private Street 1'],
            'subtotal' => 20,
            'discount_amount' => 0,
            'tax_amount' => 1.5,
            'shipping_amount' => 3,
            'total_amount' => 24.5,
            'status' => $status,
            'payment_status' => 'paid',
            'payment_method' => 'card',
            'placed_at' => now(),
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 20,
            'quantity' => 1,
            'total' => 20,
        ]);

        return [$order, $product];
    }
}
