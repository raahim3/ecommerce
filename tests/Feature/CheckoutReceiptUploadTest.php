<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CheckoutReceiptUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_uploads_an_image_receipt_without_using_image_processing(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/checkout/upload-receipt', [
            'file' => UploadedFile::fake()->image('receipt.png'),
        ])->assertOk()
            ->assertJsonPath('success', true);

        $path = 'receipts/'.$response->json('filename');
        Storage::disk('public')->assertExists($path);
        $this->assertSame(Storage::disk('public')->url($path), $response->json('url'));
    }

    public function test_it_uploads_a_pdf_receipt(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/checkout/upload-receipt', [
            'file' => UploadedFile::fake()->create('receipt.pdf', 250, 'application/pdf'),
        ])->assertOk()
            ->assertJsonPath('success', true);

        Storage::disk('public')->assertExists('receipts/'.$response->json('filename'));
    }

    public function test_it_rejects_missing_and_unsupported_receipts(): void
    {
        $this->postJson('/api/checkout/upload-receipt')
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'No receipt file uploaded.');

        $this->postJson('/api/checkout/upload-receipt', [
            'file' => UploadedFile::fake()->create('receipt.txt', 10, 'text/plain'),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);
    }
}
