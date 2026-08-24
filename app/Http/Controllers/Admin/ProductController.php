<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::with(['category', 'images'])
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%')
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
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'exists:categories,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(4),
            'description' => $request->description,
            'price' => $request->price,
            'original_price' => $request->original_price,
            'stock_quantity' => $request->stock_quantity,
            'category_id' => $request->category_id,
            'sku' => $request->sku ?? 'ATL-' . strtoupper(Str::random(6)),
            'is_active' => $request->boolean('is_active', true),
            'is_featured' => $request->boolean('is_featured', false),
            'is_new' => $request->boolean('is_new', true),
            'material' => $request->material,
            'origin' => $request->origin,
            'care_instructions' => $request->care_instructions,
            'available_colors' => $request->available_colors ?? [],
            'available_sizes' => $request->available_sizes ?? [],
            'image' => $request->image,
            'gallery' => $request->gallery ?? [],
        ]);

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product->update($request->only([
            'name', 'description', 'price', 'original_price', 'stock_quantity',
            'category_id', 'sku', 'is_active', 'is_featured', 'is_new',
            'material', 'origin', 'care_instructions',
            'available_colors', 'available_sizes', 'image', 'gallery',
        ]));

        return response()->json(['success' => true, 'product' => $product->fresh(['category', 'images'])]);
    }

    public function updateStock(Request $request, int $id): JsonResponse
    {
        $request->validate(['stock_quantity' => ['required', 'integer', 'min:0']]);
        $product = Product::findOrFail($id);
        $product->update(['stock_quantity' => $request->stock_quantity]);

        return response()->json(['success' => true, 'stock_quantity' => $product->stock_quantity]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);

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
}