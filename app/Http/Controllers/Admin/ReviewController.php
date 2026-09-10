<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = Review::with(['product:id,name,slug', 'user:id,name'])
            ->when($request->filled('status') && $request->status !== 'all', fn ($query) => $query->where('status', $request->status))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('author_name', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('comment', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        $products = Product::active()
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/reviews', [
            'reviews' => $reviews,
            'products' => $products,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'author_name' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['required', 'string'],
            'status' => ['nullable', 'in:approved,pending,rejected,hidden'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'string', 'max:2048'],
        ]);

        $review = Review::create([
            'product_id' => $validated['product_id'],
            'author_name' => $validated['author_name'],
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'status' => $validated['status'] ?? 'approved',
            'attachments' => $validated['attachments'] ?? [],
            'is_verified_buyer' => true,
        ]);

        $review->load(['product:id,name,slug', 'user:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Review added successfully.',
            'review' => $review,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'author_name' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['required', 'string'],
            'status' => ['nullable', 'in:approved,pending,rejected,hidden'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'string', 'max:2048'],
        ]);

        $review->update([
            'product_id' => $validated['product_id'],
            'author_name' => $validated['author_name'],
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'status' => $validated['status'] ?? $review->status,
            'attachments' => $validated['attachments'] ?? $review->attachments ?? [],
        ]);

        $review->load(['product:id,name,slug', 'user:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully.',
            'review' => $review,
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => ['required', 'in:approved,hidden,pending,rejected'],
        ]);

        $review = Review::findOrFail($id);
        $review->status = $request->status;
        $review->save();

        $review->load(['product:id,name,slug', 'user:id,name']);

        return response()->json([
            'success' => true,
            'message' => 'Review status updated.',
            'review' => $review,
        ]);
    }

    public function destroy(int $id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ]);
    }
}
