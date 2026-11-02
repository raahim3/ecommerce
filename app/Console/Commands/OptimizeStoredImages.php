<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Services\ProductImageService;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OptimizeStoredImages extends Command
{
    protected $signature = 'images:optimize-existing {--dry-run : List eligible images without changing files or database records}';

    protected $description = 'Convert existing local non-product images to optimized WebP files and update their references.';

    public function handle(): int
    {
        $files = collect(Storage::disk('public')->allFiles())
            ->reject(fn (string $path) => str_starts_with($path, 'products/'))
            ->map(fn (string $path) => [
                'relative' => $path,
                'absolute' => Storage::disk('public')->path($path),
            ])
            ->merge(collect(File::isDirectory(public_path('uploads'))
                ? File::allFiles(public_path('uploads'))
                : [])
                ->map(fn (\SplFileInfo $file) => [
                    'relative' => 'uploads/'.str_replace('\\', '/', Str::after($file->getPathname(), public_path('uploads').DIRECTORY_SEPARATOR)),
                    'absolute' => $file->getPathname(),
                ]))
            ->reject(fn (array $file) => str_starts_with($file['relative'], 'uploads/products/'))
            ->filter(fn (array $file) => in_array(strtolower(pathinfo($file['relative'], PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png'], true))
            ->values();

        if ($files->isEmpty()) {
            $this->info('No existing non-product JPEG or PNG images need optimization.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->table(
                ['Image', 'Current size'],
                $files->map(fn (array $file) => [
                    $file['relative'],
                    number_format(filesize($file['absolute']) / 1024, 1).' KB',
                ])->all()
            );
            $this->info("{$files->count()} existing non-product images can be optimized. No files or database records were changed.");

            return self::SUCCESS;
        }

        $optimized = [];
        $savedBytes = 0;
        $skipped = 0;

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

            ProductImageService::optimizeAssetPath($file['absolute'], $destinationPath);
            $newSize = filesize($destinationPath);
            $originalSize = filesize($file['absolute']);

            if ($newSize >= $originalSize) {
                File::delete($destinationPath);
                $skipped++;

                continue;
            }

            $optimized[$file['relative']] = [
                'source' => $file['absolute'],
                'target' => $destinationRelative,
            ];
            $savedBytes += $originalSize - $newSize;
        }

        if ($optimized === []) {
            $this->info("No images were smaller after conversion; original files were kept. {$skipped} images were unchanged.");

            return self::SUCCESS;
        }

        $urlMap = collect($optimized)->mapWithKeys(
            fn (array $file, string $source) => [$source => $file['target']]
        )->all();

        DB::transaction(function () use ($urlMap): void {
            $this->updateUrlColumn(ProductImage::query(), 'image_url', $urlMap);
            $this->updateUrlColumn(ProductVariant::query(), 'image_url', $urlMap);
            $this->updateUrlColumn(OrderItem::query(), 'product_image', $urlMap);
            $this->updateUrlColumn(Category::query(), 'image', $urlMap);
            $this->updateUrlColumn(Order::query(), 'payment_receipt_url', $urlMap);
            $this->updateUrlColumn(Expense::query(), 'receipt_url', $urlMap);

            Product::query()->chunkById(100, function ($products) use ($urlMap): void {
                foreach ($products as $product) {
                    $image = $this->optimizedUrl($product->image, $urlMap);
                    $gallery = $this->replaceValue($product->gallery ?? [], $urlMap);

                    if ($image !== $product->image || $gallery !== ($product->gallery ?? [])) {
                        $product->image = $image;
                        $product->gallery = $gallery;
                        $product->saveQuietly();
                    }
                }
            });

            Review::query()->chunkById(100, function ($reviews) use ($urlMap): void {
                $this->updateArrayUrls($reviews, 'attachments', $urlMap);
            });

            Setting::query()->chunkById(100, function ($settings) use ($urlMap): void {
                foreach ($settings as $setting) {
                    $value = $this->replaceValue($setting->value, $urlMap);
                    if ($value !== $setting->value) {
                        $setting->value = $value;
                        $setting->saveQuietly();
                        Setting::clearCache($setting->key);
                    }
                }
            });
        });

        foreach (array_keys($urlMap) as $relativeSource) {
            $sourcePath = str_starts_with($relativeSource, 'uploads/')
                ? public_path($relativeSource)
                : Storage::disk('public')->path($relativeSource);
            File::delete($sourcePath);
        }

        $this->info(sprintf(
            'Optimized %d existing images and saved %.2f MB. %d images were already smaller as-is.',
            count($optimized),
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
     * @param  iterable<int, Review>  $reviews
     * @param  array<string, string>  $urlMap
     */
    private function updateArrayUrls(iterable $reviews, string $column, array $urlMap): void
    {
        foreach ($reviews as $review) {
            $values = $this->replaceValue($review->{$column} ?? [], $urlMap);
            if ($values !== ($review->{$column} ?? [])) {
                $review->{$column} = $values;
                $review->saveQuietly();
            }
        }
    }

    /**
     * @param  array<string, string>  $urlMap
     */
    private function replaceValue(mixed $value, array $urlMap): mixed
    {
        if (is_array($value)) {
            foreach ($value as $key => $nestedValue) {
                $value[$key] = $this->replaceValue($nestedValue, $urlMap);
            }

            return $value;
        }

        return is_string($value) ? $this->optimizedUrl($value, $urlMap) : $value;
    }

    /**
     * @param  array<string, string>  $urlMap
     */
    private function optimizedUrl(?string $url, array $urlMap): ?string
    {
        if ($url === null || $url === '') {
            return $url;
        }

        $relativeSource = $this->sourceRelativePath($url);
        if ($relativeSource !== null && isset($urlMap[$relativeSource])) {
            $path = parse_url($url, PHP_URL_PATH) ?: $url;
            $updatedPath = substr($path, 0, (int) strrpos($path, '/') + 1).basename($urlMap[$relativeSource]);

            return substr_replace($url, $updatedPath, (int) strpos($url, $path), strlen($path));
        }

        if (! str_contains($url, '://')) {
            $relativeSource = ltrim(rawurldecode($url), '/');
            if (isset($urlMap[$relativeSource])) {
                return $urlMap[$relativeSource];
            }
        }

        foreach ($urlMap as $source => $target) {
            $oldPath = str_starts_with($source, 'uploads/') ? '/'.$source : '/storage/'.$source;
            $newPath = str_starts_with($source, 'uploads/') ? '/'.$target : '/storage/'.$target;
            $url = str_replace($oldPath, $newPath, $url);
        }

        return $url;
    }

    private function sourceRelativePath(?string $url): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        $path = ltrim(rawurldecode(parse_url($url, PHP_URL_PATH) ?: $url), '/');

        if (str_starts_with($path, 'storage/')) {
            return substr($path, strlen('storage/'));
        }

        if (str_starts_with($path, 'uploads/')) {
            return $path;
        }

        return null;
    }
}
