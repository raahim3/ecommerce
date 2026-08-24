<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category')
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%')
            )
            ->when($request->filled('stock'), function ($q) use ($request) {
                if ($request->stock === 'low') $q->where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0);
                elseif ($request->stock === 'out') $q->where('stock_quantity', 0);
                elseif ($request->stock === 'in') $q->where('stock_quantity', '>', 10);
            });

        $products = $query->orderBy('stock_quantity')->paginate(30)->withQueryString();

        $summary = [
            'total_products' => Product::count(),
            'in_stock' => Product::where('stock_quantity', '>', 10)->count(),
            'low_stock' => Product::where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0)->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'total_units' => Product::sum('stock_quantity'),
        ];

        return Inertia::render('Admin/inventory', [
            'products' => $products,
            'summary' => $summary,
            'filters' => $request->only(['search', 'stock']),
        ]);
    }

    public function bulkUpdateStock(Request $request): JsonResponse
    {
        $request->validate([
            'updates' => ['required', 'array'],
            'updates.*.id' => ['required', 'exists:products,id'],
            'updates.*.stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->updates as $update) {
            Product::where('id', $update['id'])->update(['stock_quantity' => $update['stock_quantity']]);
        }

        return response()->json(['success' => true, 'updated' => count($request->updates)]);
    }
}