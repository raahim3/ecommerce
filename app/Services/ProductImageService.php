<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageService
{
    /**
     * Process and sync product images into product_images table and dedicated product storage directory.
     * Storage structure: storage/app/public/products/{productId}/
     * Public URL: /storage/products/{productId}/{filename}
     *
     * @param int $productId
     * @param array $images Array of UploadedFile instances, base64 strings, or existing URLs
     * @return array ['primary' => string|null, 'gallery' => array]
     */
    public static function syncImages(int $productId, array $images): array
    {
        if (empty($images)) {
            ProductImage::where('product_id', $productId)->delete();
            return ['primary' => null, 'gallery' => []];
        }

        // Ensure directory exists: storage/app/public/products/{productId}
        $relativeDir = "products/{$productId}";
        $fullDirPath = storage_path("app/public/{$relativeDir}");
        if (!File::exists($fullDirPath)) {
            File::makeDirectory($fullDirPath, 0755, true);
        }

        $processedUrls = [];

        foreach ($images as $index => $item) {
            if (empty($item)) {
                continue;
            }

            $cleanUrl = null;

            // Case 1: UploadedFile instance
            if ($item instanceof UploadedFile) {
                $ext = $item->getClientOriginalExtension() ?: 'jpg';
                $filename = time() . '_' . Str::random(8) . '.' . $ext;
                $item->move($fullDirPath, $filename);
                $cleanUrl = "/storage/{$relativeDir}/{$filename}";
            }
            // Case 2: Base64 data string (e.g. data:image/jpeg;base64,...)
            elseif (is_string($item) && str_starts_with($item, 'data:image')) {
                $cleanUrl = self::saveBase64Image($item, $fullDirPath, $relativeDir);
            }
            // Case 3: Temporary uploaded file that needs to be moved to product directory
            elseif (is_string($item) && (str_contains($item, '/storage/products/temp/') || str_contains($item, '/uploads/products/'))) {
                $cleanUrl = self::moveTempImageToProductDir($item, $fullDirPath, $relativeDir);
            }
            // Case 4: Already in the product's directory or external URL (e.g., Unsplash, CDN)
            elseif (is_string($item)) {
                $cleanUrl = $item;
            }

            if ($cleanUrl) {
                $processedUrls[] = $cleanUrl;
            }
        }

        // Refresh product_images table
        ProductImage::where('product_id', $productId)->delete();

        foreach ($processedUrls as $sortOrder => $url) {
            ProductImage::create([
                'product_id' => $productId,
                'image_url' => $url,
                'is_primary' => ($sortOrder === 0),
                'sort_order' => $sortOrder,
            ]);
        }

        $primary = $processedUrls[0] ?? null;
        $gallery = array_slice($processedUrls, 1);

        return [
            'primary' => $primary,
            'gallery' => $gallery,
            'all' => $processedUrls,
        ];
    }

    /**
     * Decode and save base64 image data to the product folder.
     */
    protected static function saveBase64Image(string $base64String, string $fullDirPath, string $relativeDir): ?string
    {
        try {
            if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
                $extension = strtolower($matches[1]);
                if ($extension === 'jpeg') {
                    $extension = 'jpg';
                }
                $data = substr($base64String, strpos($base64String, ',') + 1);
                $decoded = base64_decode($data);

                if ($decoded !== false) {
                    $filename = time() . '_' . Str::random(8) . '.' . $extension;
                    $targetPath = $fullDirPath . DIRECTORY_SEPARATOR . $filename;
                    File::put($targetPath, $decoded);
                    return "/storage/{$relativeDir}/{$filename}";
                }
            }
        } catch (\Throwable $e) {
            // Log if needed
        }
        return null;
    }

    /**
     * Move a temp file from public/uploads or storage/temp into the specific product's folder.
     */
    protected static function moveTempImageToProductDir(string $sourceUrl, string $fullDirPath, string $relativeDir): string
    {
        // Try locating the file in public_path or storage_path
        $relativeSource = ltrim($sourceUrl, '/');
        $publicSource = public_path($relativeSource);
        $storageSource = storage_path("app/public/" . preg_replace('#^storage/#', '', $relativeSource));

        $actualSource = null;
        if (File::exists($publicSource)) {
            $actualSource = $publicSource;
        } elseif (File::exists($storageSource)) {
            $actualSource = $storageSource;
        }

        if ($actualSource && !File::isDirectory($actualSource)) {
            $filename = basename($actualSource);
            $targetPath = $fullDirPath . DIRECTORY_SEPARATOR . $filename;
            
            if ($actualSource !== $targetPath) {
                File::copy($actualSource, $targetPath);
            }
            return "/storage/{$relativeDir}/{$filename}";
        }

        return $sourceUrl;
    }
}
