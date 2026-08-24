<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::whereNull('parent_id')
            ->with(['children' => fn($q) => $q->withCount('products')->orderBy('sort_order')->orderBy('name')])
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'parent_id' => ['nullable', 'exists:categories,id'],
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'image' => $request->image,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->boolean('is_active', true),
            'parent_id' => $request->filled('parent_id') ? (int) $request->parent_id : null,
        ]);

        return response()->json(['success' => true, 'category' => $category]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,' . $id],
            'parent_id' => ['nullable', 'exists:categories,id'],
        ]);

        $category->update([
            'name' => $request->name,
            'description' => $request->description ?? $category->description,
            'image' => $request->image ?? $category->image,
            'sort_order' => $request->sort_order ?? $category->sort_order,
            'is_active' => $request->boolean('is_active', $category->is_active),
            'parent_id' => $request->filled('parent_id') ? (int) $request->parent_id : null,
        ]);

        return response()->json(['success' => true, 'category' => $category]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->update(['is_active' => !$category->is_active]);

        return response()->json(['success' => true, 'is_active' => $category->is_active]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete category with active products. Reassign them first.',
            ], 422);
        }

        $category->delete();
        return response()->json(['success' => true]);
    }
}