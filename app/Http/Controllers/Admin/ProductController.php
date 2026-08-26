<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\NewsletterSubscriber;
use App\Models\InventoryLog;
use App\Mail\ProductPublishedEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::with(['category', 'images'])
            ->when($request->filled('search'), fn($q) => $q->where(function ($searchQuery) use ($request) {
                $searchQuery->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            })
            )
            ->when($request->filled('category'), fn($q) => $q->where('category_id', $request->category))
            ->when($request->filled('status'), fn($q) =>
                $request->status === 'active' ? $q->active() : $q->where('is_active', false)
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/products', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'slug']);
        return Inertia::render('Admin/product-create', [
            'categories' => $categories,
        ]);
    }

    public function edit(int $id): Response
    {
        $product = Product::with(['category', 'images', 'variants'])->findOrFail($id);
        $categories = Category::active()->orderBy('name')->get(['id', 'name', 'slug']);
        return Inertia::render('Admin/product-create', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // Resilient Category Resolution
        $categoryId = $request->category_id;
        if (!$categoryId || !Category::where('id', $categoryId)->exists()) {
            if ($request->filled('category')) {
                $matched = Category::where('name', $request->category)->orWhere('slug', Str::slug($request->category))->first();
                $categoryId = $matched ? $matched->id : null;
            }
            if (!$categoryId) {
                $first = Category::first();
                $categoryId = $first ? $first->id : Category::create(['name' => 'Fashion', 'slug' => 'fashion', 'is_active' => true])->id;
            }
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'description' => $request->description ?? $request->name,
            'price' => $request->price,
            'original_price' => $request->original_price ?? $request->compare_at_price,
            'compare_at_price' => $request->original_price ?? $request->compare_at_price,
            'stock_quantity' => $request->stock_quantity,
            'weight_kg' => $request->input('weight_kg', 0),
            'category_id' => $categoryId,
            'sku' => $request->sku ?? 'ATL-' . strtoupper(Str::random(6)),
            'is_active' => $request->boolean('is_active', true),
            'is_featured' => $request->boolean('is_featured', false),
            'is_new' => $request->boolean('is_new', true),
            'is_on_sale' => $request->boolean('is_on_sale', false),
            'material' => $request->material,
            'origin' => $request->origin,
            'care_instructions' => $request->care_instructions,
            'available_colors' => $request->available_colors ?? [],
            'available_sizes' => $request->available_sizes ?? [],
            'image' => null,
            'gallery' => [],
            'tagline' => $request->tagline,
            'highlights' => $request->highlights ?? [],
            'specs' => $request->specs ?? [],
            'faqs' => $request->faqs ?? [],
        ]);

        // Process images into storage/app/public/products/{id}/ and sync product_images table
        $rawImages = [];
        if ($request->hasFile('images')) {
            $rawImages = $request->file('images');
        } elseif ($request->hasFile('image')) {
            $rawImages = [$request->file('image')];
        } elseif (is_array($request->gallery) && count($request->gallery) > 0) {
            $rawImages = $request->gallery;
        } elseif ($request->image) {
            $rawImages = [$request->image];
        }

        if ($request->image && is_string($request->image) && !in_array($request->image, $rawImages)) {
            array_unshift($rawImages, $request->image);
        }

        $imageResult = \App\Services\ProductImageService::syncImages($product->id, $rawImages);
        $product->update([
            'image' => $imageResult['primary'],
            'gallery' => $imageResult['gallery'],
        ]);

        if ($product->is_active) {
            $this->notifySubscribers($product);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product published successfully',
            'product' => $product->fresh(['category', 'images']),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:10000'],
        ]);

        $categoryId = $request->category_id ?? $product->category_id;
        if ($categoryId && !Category::where('id', $categoryId)->exists()) {
            $categoryId = $product->category_id;
        }

        $product->update([
            'name' => $request->name,
            'description' => $request->description ?? $product->description,
            'price' => $request->price,
            'original_price' => $request->original_price ?? $product->original_price,
            'compare_at_price' => $request->original_price ?? $product->compare_at_price,
            'stock_quantity' => $request->stock_quantity,
            'weight_kg' => $request->input('weight_kg', $product->weight_kg),
            'category_id' => $categoryId,
            'sku' => $request->sku ?? $product->sku,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $product->is_active,
            'is_featured' => $request->has('is_featured') ? $request->boolean('is_featured') : $product->is_featured,
            'is_new' => $request->has('is_new') ? $request->boolean('is_new') : $product->is_new,
            'is_on_sale' => $request->has('is_on_sale') ? $request->boolean('is_on_sale') : $product->is_on_sale,
            'material' => $request->material ?? $product->material,
            'origin' => $request->origin ?? $product->origin,
            'care_instructions' => $request->care_instructions ?? $product->care_instructions,
            'available_colors' => $request->available_colors ?? $product->available_colors,
            'available_sizes' => $request->available_sizes ?? $product->available_sizes,
            'tagline' => $request->tagline ?? $product->tagline,
            'highlights' => $request->highlights ?? $product->highlights,
            'specs' => $request->specs ?? $product->specs,
            'faqs' => $request->faqs ?? $product->faqs,
        ]);

        // Process images into storage/app/public/products/{id}/ and sync product_images table
        if ($request->has('images') || $request->has('gallery') || $request->has('image')) {
            $rawImages = [];
            if ($request->hasFile('images')) {
                $rawImages = $request->file('images');
            } elseif ($request->hasFile('image')) {
                $rawImages = [$request->file('image')];
            } elseif (is_array($request->gallery) && count($request->gallery) > 0) {
                $rawImages = $request->gallery;
            } elseif ($request->image) {
                $rawImages = [$request->image];
            }

            if ($request->image && is_string($request->image) && !in_array($request->image, $rawImages)) {
                array_unshift($rawImages, $request->image);
            }

            $imageResult = \App\Services\ProductImageService::syncImages($product->id, $rawImages);
            $product->update([
                'image' => $imageResult['primary'],
                'gallery' => $imageResult['gallery'],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => $product->fresh(['category', 'images']),
        ]);
    }

    public function updateStock(Request $request, int $id): JsonResponse
    {
        $request->validate(['stock_quantity' => ['required', 'integer', 'min:0']]);
        $product = Product::findOrFail($id);
        $previousQuantity = $product->stock_quantity;
        $product->update(['stock_quantity' => $request->stock_quantity]);
        if ($previousQuantity !== $product->stock_quantity) {
            InventoryLog::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $product->stock_quantity,
                'adjustment_type' => $request->input('adjustment_type', 'set'),
                'reason' => $request->input('reason'),
            ]);
        }

        return response()->json(['success' => true, 'stock_quantity' => $product->stock_quantity]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

        if ($product->is_active) {
            $this->notifySubscribers($product);
        }

        return response()->json(['success' => true, 'is_active' => $product->is_active]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->images()->delete();
        $product->variants()->delete();
        $product->delete();

        return response()->json(['success' => true]);
    }

    private function notifySubscribers(Product $product): void
    {
        NewsletterSubscriber::where('is_active', true)
            ->each(fn ($subscriber) => Mail::to($subscriber->email)->send(new ProductPublishedEmail($product)));
    }
}