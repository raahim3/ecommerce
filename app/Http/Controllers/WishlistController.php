<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(): Response
    {
        $wishlistProducts = [];

        if (Auth::check()) {
            $wishlistItems = Wishlist::where('user_id', Auth::id())
                ->with(['product.category', 'product.images', 'product.variants'])
                ->latest()
                ->get();

            $wishlistProducts = $wishlistItems->pluck('product')->filter();
        }

        $recommendedProducts = Product::active()
            ->with(['category', 'images', 'variants'])
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('Wishlist', [
            'initialWishlist' => $wishlistProducts,
            'recommendedProducts' => $recommendedProducts,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Please sign in to save items to your permanent wishlist.',
            ]);
        }

        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        $userId = Auth::id();
        $productId = (int) $request->product_id;

        $existing = Wishlist::where('user_id', $userId)->where('product_id', $productId)->first();

        if ($existing) {
            $existing->delete();
            $wished = false;
            $msg = 'Removed from wishlist.';
        } else {
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $productId,
            ]);
            $wished = true;
            $msg = 'Saved to wishlist.';
        }

        return response()->json([
            'authenticated' => true,
            'wished' => $wished,
            'message' => $msg,
        ]);
    }

    public function getWishlistIds(): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['ids' => []]);
        }

        $ids = Wishlist::where('user_id', Auth::id())->pluck('product_id')->toArray();
        return response()->json(['ids' => $ids]);
    }
}