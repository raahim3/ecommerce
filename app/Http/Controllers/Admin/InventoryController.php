<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['category', 'images'])
            ->when($request->filled('search'), fn($q) => $q->where(function ($searchQuery) use ($request) {
                $searchQuery->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            })
            )
            ->when($request->filled('stock'), function ($q) use ($request) {
                if ($request->stock === 'low') $q->where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0);
                elseif ($request->stock === 'out') $q->where('stock_quantity', 0);
                elseif ($request->stock === 'in') $q->where('stock_quantity', '>', 10);
            });

        $products = $query->orderBy('stock_quantity')->paginate(20)->withQueryString();

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
            $product = Product::findOrFail($update['id']);
            $previousQuantity = $product->stock_quantity;
            $product->update(['stock_quantity' => $update['stock_quantity']]);
            if ($previousQuantity !== $product->stock_quantity) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'previous_quantity' => $previousQuantity,
                    'new_quantity' => $product->stock_quantity,
                    'adjustment_type' => 'bulk',
                    'reason' => 'Bulk stock update',
                ]);
            }
        }

        return response()->json(['success' => true, 'updated' => count($request->updates)]);
    }

    public function activities(Request $request): Response
    {
        $logs = InventoryLog::with(['product:id,name,sku', 'user:id,name'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->whereHas('product', fn($productQuery) => $productQuery
                    ->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%'));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/inventory-activities', [
            'logs' => $logs,
            'filters' => $request->only(['search']),
        ]);
    }
}