<?php

namespace App\Services;

use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Laravel\Facades\Image;
use InvalidArgumentException;

class ProductImageService
{
    private const RASTER_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    public static function optimize(UploadedFile $file, string $directory = 'products/temp'): string
    {
        $relativePath = trim($directory, '/').'/'.Str::uuid().'.webp';
        $absolutePath = Storage::disk('public')->path($relativePath);
        File::ensureDirectoryExists(dirname($absolutePath));

        Image::decodePath($file->getRealPath())
            ->scaleDown(width: 800, height: 800)
            ->encode(new WebpEncoder(quality: 80))
            ->save($absolutePath);
        self::optimizeThumbnailPath($absolutePath, self::thumbnailPath($absolutePath));

        return '/storage/'.$relativePath;
    }

    public static function optimizeAsset(UploadedFile $file, string $directory): string
    {
        $relativePath = trim($directory, '/').'/'.Str::uuid().'.webp';
        $absolutePath = Storage::disk('public')->path($relativePath);
        File::ensureDirectoryExists(dirname($absolutePath));

        Image::decodePath($file->getRealPath())
            ->scaleDown(width: 1920, height: 1920)
            ->encode(new WebpEncoder(quality: 82))
            ->save($absolutePath);

        return '/storage/'.$relativePath;
    }

    public static function optimizePath(string $sourcePath, string $destinationPath): void
    {
        File::ensureDirectoryExists(dirname($destinationPath));

        Image::decodePath($sourcePath)
            ->scaleDown(width: 800, height: 800)
            ->encode(new WebpEncoder(quality: 80))
            ->save($destinationPath);
    }

    public static function optimizeAssetPath(string $sourcePath, string $destinationPath): void
    {
        File::ensureDirectoryExists(dirname($destinationPath));

        Image::decodePath($sourcePath)
            ->scaleDown(width: 1920, height: 1920)
            ->encode(new WebpEncoder(quality: 82))
            ->save($destinationPath);
    }

    public static function optimizeThumbnailPath(string $sourcePath, string $destinationPath): void
    {
        File::ensureDirectoryExists(dirname($destinationPath));

        Image::decodePath($sourcePath)
            ->scaleDown(width: 400, height: 400)
            ->encode(new WebpEncoder(quality: 80))
            ->save($destinationPath);
    }

    public static function thumbnailPath(string $webpPath): string
    {
        return (string) preg_replace('/\.webp$/i', '-400w.webp', $webpPath);
    }

    /**
     * Sync uploaded, temporary, and existing image URLs into a product's image records.
     *
     * @param  array<int, UploadedFile|string>  $images
     * @return array{primary: string|null, gallery: array<int, string>, all: array<int, string>}
     */
    public static function syncImages(int $productId, array $images): array
    {
        $relativeDirectory = "products/{$productId}";
        $processedUrls = [];

        foreach ($images as $item) {
            if (empty($item)) {
                continue;
            }

            if ($item instanceof UploadedFile) {
                $processedUrls[] = self::optimize($item, $relativeDirectory);

                continue;
            }

            if (! is_string($item)) {
                continue;
            }

            if (str_starts_with($item, 'data:image')) {
                $processedUrls[] = self::saveBase64Image($item, $relativeDirectory);

                continue;
            }

            if (self::isTemporaryProductImage($item)) {
                $processedUrl = self::moveTempImageToProductDir($item, $relativeDirectory);
                if ($processedUrl !== null) {
                    $processedUrls[] = $processedUrl;
                }

                continue;
            }

            $processedUrls[] = $item;
        }

        ProductImage::where('product_id', $productId)->delete();

        foreach ($processedUrls as $sortOrder => $url) {
            ProductImage::create([
                'product_id' => $productId,
                'image_url' => $url,
                'is_primary' => $sortOrder === 0,
                'sort_order' => $sortOrder,
            ]);
        }

        return [
            'primary' => $processedUrls[0] ?? null,
            'gallery' => array_slice($processedUrls, 1),
            'all' => $processedUrls,
        ];
    }

    private static function saveBase64Image(string $base64String, string $relativeDirectory): string
    {
        if (! preg_match('/^data:image\/(?:jpeg|jpg|png|webp);base64,/', $base64String, $matches)) {
            throw new InvalidArgumentException('Product images must be valid JPEG, PNG, or WebP data.');
        }

        $encodedData = substr($base64String, strlen($matches[0]));
        $decoded = base64_decode($encodedData, true);
        if ($decoded === false) {
            throw new InvalidArgumentException('The product image data could not be decoded.');
        }

        $relativePath = trim($relativeDirectory, '/').'/'.Str::uuid().'.webp';
        $absolutePath = Storage::disk('public')->path($relativePath);
        File::ensureDirectoryExists(dirname($absolutePath));

        Image::decodeBinary($decoded)
            ->scaleDown(width: 800, height: 800)
            ->encode(new WebpEncoder(quality: 80))
            ->save($absolutePath);
        self::optimizeThumbnailPath($absolutePath, self::thumbnailPath($absolutePath));

        return '/storage/'.$relativePath;
    }

    private static function isTemporaryProductImage(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        return str_contains($path, '/storage/products/temp/')
            || str_contains($path, '/uploads/products/');
    }

    private static function moveTempImageToProductDir(string $sourceUrl, string $relativeDirectory): ?string
    {
        $sourcePath = parse_url($sourceUrl, PHP_URL_PATH) ?: $sourceUrl;
        $sourcePath = ltrim(rawurldecode($sourcePath), '/');

        if (str_contains($sourcePath, 'storage/products/')) {
            $sourcePath = 'products/'.Str::after($sourcePath, 'storage/products/');
        } elseif (str_contains($sourcePath, 'uploads/products/')) {
            $sourcePath = 'uploads/products/'.Str::after($sourcePath, 'uploads/products/');
        } elseif (str_starts_with($sourcePath, 'storage/')) {
            $sourcePath = substr($sourcePath, strlen('storage/'));
        }

        $copyFromPublicPath = false;
        if (str_starts_with($sourcePath, 'products/')) {
            $absoluteSource = Storage::disk('public')->path($sourcePath);
        } elseif (str_starts_with($sourcePath, 'uploads/products/')) {
            $absoluteSource = public_path($sourcePath);
            $copyFromPublicPath = true;
        } else {
            return $sourceUrl;
        }

        if (! File::exists($absoluteSource) || File::isDirectory($absoluteSource)) {
            return $sourceUrl;
        }

        $extension = strtolower(pathinfo($absoluteSource, PATHINFO_EXTENSION));
        if ($extension === 'webp' && str_starts_with($sourcePath, 'products/temp/')) {
            $filename = Str::uuid().'.webp';
            $relativePath = trim($relativeDirectory, '/').'/'.$filename;
            $destinationPath = Storage::disk('public')->path($relativePath);
            File::ensureDirectoryExists(dirname($destinationPath));
            File::copy($absoluteSource, $destinationPath);
            $sourceThumbnail = self::thumbnailPath($absoluteSource);
            if (File::exists($sourceThumbnail)) {
                File::copy($sourceThumbnail, self::thumbnailPath($destinationPath));
            } else {
                self::optimizeThumbnailPath($destinationPath, self::thumbnailPath($destinationPath));
            }

            return '/storage/'.$relativePath;
        }

        if (in_array($extension, self::RASTER_EXTENSIONS, true)) {
            return self::optimize(
                new UploadedFile($absoluteSource, basename($absoluteSource), null, null, true),
                $relativeDirectory
            );
        }

        $filename = Str::uuid().'.'.$extension;
        $relativePath = trim($relativeDirectory, '/').'/'.$filename;
        $destinationPath = Storage::disk('public')->path($relativePath);
        File::ensureDirectoryExists(dirname($destinationPath));
        if ($copyFromPublicPath) {
            File::copy($absoluteSource, $destinationPath);
        } else {
            Storage::disk('public')->copy($sourcePath, $relativePath);
        }

        return '/storage/'.$relativePath;
    }
}
