<?php

namespace App\Console\Commands;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Services\ProductImageService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OptimizeProductImages extends Command
{
    protected $signature = 'products:optimize-images {--dry-run : List eligible images without changing files or database records}';

    protected $description = 'Convert existing local product images to smaller WebP files and update their references.';

    public function handle(): int
    {
        $files = collect(Storage::disk('public')->allFiles('products'))
            ->reject(fn (string $path) => str_starts_with($path, 'products/temp/'))
            ->map(fn (string $path) => [
                'relative' => $path,
                'absolute' => Storage::disk('public')->path($path),
            ])
            ->merge(collect(File::isDirectory(public_path('uploads/products'))
                ? File::allFiles(public_path('uploads/products'))
                : [])
                ->map(fn (\SplFileInfo $file) => [
                    'relative' => 'uploads/products/'.str_replace('\\', '/', Str::after($file->getPathname(), public_path('uploads/products').DIRECTORY_SEPARATOR)),
                    'absolute' => $file->getPathname(),
                ]))
            ->filter(fn (array $file) => in_array(strtolower(pathinfo($file['relative'], PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'webp'], true))
            ->values();

        $referencedPaths = $this->referencedImagePaths();
        $files = $files
            ->filter(fn (array $file) => isset($referencedPaths[$file['relative']]))
            ->reject(fn (array $file) => str_ends_with(strtolower($file['relative']), '-400w.webp'))
            ->values();
        $thumbnailFiles = $files
            ->filter(fn (array $file) => strtolower(pathinfo($file['relative'], PATHINFO_EXTENSION)) === 'webp')
            ->filter(fn (array $file) => ! File::exists(ProductImageService::thumbnailPath($file['absolute'])))
            ->values();
        $files = $files
            ->filter(fn (array $file) => in_array(strtolower(pathinfo($file['relative'], PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png'], true))
            ->values();

        if ($files->isEmpty() && $thumbnailFiles->isEmpty()) {
            $this->info('No referenced product images need optimization or responsive thumbnails.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->table(
                ['Task', 'Image', 'Current size'],
                $files->map(fn (array $file) => [
                    'Convert to WebP',
                    $file['relative'],
                    number_format(filesize($file['absolute']) / 1024, 1).' KB',
                ])->merge($thumbnailFiles->map(fn (array $file) => [
                    'Generate 400px variant',
                    $file['relative'],
                    number_format(filesize($file['absolute']) / 1024, 1).' KB',
                ]))->all()
            );
            $this->info("{$files->count()} images need WebP optimization and {$thumbnailFiles->count()} need responsive thumbnails. No files or database records were changed.");

            return self::SUCCESS;
        }

        $optimized = [];
        $originalBytes = 0;
        $optimizedBytes = 0;
        $skipped = 0;
        $thumbnailsGenerated = 0;

        foreach ($thumbnailFiles as $file) {
            ProductImageService::optimizeThumbnailPath(
                $file['absolute'],
                ProductImageService::thumbnailPath($file['absolute']),
            );
            $thumbnailsGenerated++;
        }

        foreach ($files as $file) {
            $destinationRelative = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file['relative']);
            $destinationPath = str_starts_with($destinationRelative, 'uploads/')
                ? public_path($destinationRelative)
                : Storage::disk('public')->path($destinationRelative);

            if (File::exists($destinationPath)) {
                $directory = dirname($destinationRelative);
                $filename = pathinfo($destinationRelative, PATHINFO_FILENAME);
                $destinationRelative = $directory.'/'.$filename.'-'.Str::uuid().'.webp';
                $destinationPath = str_starts_with($destinationRelative, 'uploads/')
                    ? public_path($destinationRelative)
                    : Storage::disk('public')->path($destinationRelative);
            }

            ProductImageService::optimizePath($file['absolute'], $destinationPath);
            $newSize = filesize($destinationPath);

            if ($newSize >= filesize($file['absolute'])) {
                File::delete($destinationPath);
                $skipped++;

                continue;
            }

            $thumbnailPath = ProductImageService::thumbnailPath($destinationPath);
            ProductImageService::optimizeThumbnailPath($destinationPath, $thumbnailPath);
            $optimized[$file['relative']] = [
                'source' => $file['absolute'],
                'destination' => $destinationPath,
                'target' => $destinationRelative,
            ];
            $originalBytes += filesize($file['absolute']);
            $optimizedBytes += $newSize + filesize($thumbnailPath);
            $thumbnailsGenerated++;
        }

        if ($optimized === [] && $thumbnailsGenerated === 0) {
            $this->info('No images could be reduced in size; original files were kept.');

            return self::SUCCESS;
        }

        $urlMap = collect($optimized)->mapWithKeys(
            fn (array $file, string $source) => [$source => $file['target']]
        )->all();

        DB::transaction(function () use ($urlMap): void {
            $this->updateUrlColumn(ProductImage::query(), 'image_url', $urlMap);
            $this->updateUrlColumn(ProductVariant::query(), 'image_url', $urlMap);
            $this->updateUrlColumn(OrderItem::query(), 'product_image', $urlMap);

            Product::query()->chunkById(100, function ($products) use ($urlMap): void {
                foreach ($products as $product) {
                    $image = $this->optimizedUrl($product->image, $urlMap);
                    $gallery = $this->replaceUrls($product->gallery ?? [], $urlMap);

                    if ($image !== $product->image || $gallery !== ($product->gallery ?? [])) {
                        $product->image = $image;
                        $product->gallery = $gallery;
                        $product->saveQuietly();
                    }
                }
            });

            Review::query()->chunkById(100, function ($reviews) use ($urlMap): void {
                foreach ($reviews as $review) {
                    $attachments = $this->replaceUrls($review->attachments ?? [], $urlMap);
                    if ($attachments !== ($review->attachments ?? [])) {
                        $review->attachments = $attachments;
                        $review->saveQuietly();
                    }
                }
            });
        });

        foreach ($optimized as $file) {
            File::delete($file['source']);
        }

        $savedBytes = $originalBytes - $optimizedBytes;
        $this->info(sprintf(
            'Optimized %d images and generated %d responsive thumbnails; saved %.2f MB. %d images were already smaller as-is.',
            count($optimized),
            $thumbnailsGenerated,
            $savedBytes / 1024 / 1024,
            $skipped
        ));

        return self::SUCCESS;
    }

    /**
     * @param  array<string, string>  $urlMap
     */
    private function updateUrlColumn(Builder $query, string $column, array $urlMap): void
    {
        $query->chunkById(100, function ($records) use ($column, $urlMap): void {
            foreach ($records as $record) {
                $url = $this->optimizedUrl($record->{$column}, $urlMap);
                if ($url !== $record->{$column}) {
                    $record->{$column} = $url;
                    $record->saveQuietly();
                }
            }
        });
    }

    /**
     * @param  array<string, string>  $urlMap
     */
    private function replaceUrls(array $values, array $urlMap): array
    {
        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $values[$key] = $this->replaceUrls($value, $urlMap);
            } elseif (is_string($value)) {
                $values[$key] = $this->optimizedUrl($value, $urlMap);
            }
        }

        return $values;
    }

    /**
     * @param  array<string, string>  $urlMap
     */
    private function optimizedUrl(?string $url, array $urlMap): ?string
    {
        $relativeSource = $this->sourceRelativePath($url);
        if ($relativeSource === null) {
            return $url;
        }

        $target = $urlMap[$relativeSource] ?? null;
        if ($target === null) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $filename = basename($target);
        $slash = strrpos($path, '/');
        $updatedPath = ($slash === false ? '' : substr($path, 0, $slash + 1)).$filename;

        return substr_replace($url, $updatedPath, strpos($url, $path), strlen($path));
    }

    private function sourceRelativePath(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $decodedPath = rawurldecode($path);
        $normalizedPath = ltrim($decodedPath, '/');

        if (str_contains($normalizedPath, 'storage/products/')) {
            $relativeSource = 'products/'.Str::after($normalizedPath, 'storage/products/');
        } elseif (str_contains($normalizedPath, 'uploads/products/')) {
            $relativeSource = 'uploads/products/'.Str::after($normalizedPath, 'uploads/products/');
        } elseif (str_starts_with($normalizedPath, 'products/')) {
            $relativeSource = $normalizedPath;
        } else {
            return null;
        }

        return $relativeSource;
    }

    /**
     * @return array<string, true>
     */
    private function referencedImagePaths(): array
    {
        $paths = [];
        $addUrl = function (?string $url) use (&$paths): void {
            $path = $this->sourceRelativePath($url);
            if ($path !== null && ! str_ends_with(strtolower($path), '-400w.webp')) {
                $paths[$path] = true;
            }
        };

        ProductImage::query()->pluck('image_url')->each($addUrl);
        ProductVariant::query()->whereNotNull('image_url')->pluck('image_url')->each($addUrl);
        OrderItem::query()->whereNotNull('product_image')->pluck('product_image')->each($addUrl);

        Product::query()->select(['id', 'image', 'gallery'])->chunkById(100, function ($products) use ($addUrl): void {
            foreach ($products as $product) {
                $addUrl($product->image);
                foreach ($product->gallery ?? [] as $url) {
                    if (is_string($url)) {
                        $addUrl($url);
                    }
                }
            }
        });

        Review::query()->select(['id', 'attachments'])->chunkById(100, function ($reviews) use ($addUrl): void {
            foreach ($reviews as $review) {
                foreach ($review->attachments ?? [] as $attachment) {
                    if (is_string($attachment)) {
                        $addUrl($attachment);
                    }
                }
            }
        });

        return $paths;
    }
}
