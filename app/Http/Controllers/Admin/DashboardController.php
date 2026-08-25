<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Core KPIs
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $revenueThisMonth = Order::where('payment_status', 'paid')
            ->whereBetween('placed_at', [$startOfMonth, $now])->sum('total_amount');
        $revenueLastMonth = Order::where('payment_status', 'paid')
            ->whereBetween('placed_at', [$startOfLastMonth, $endOfLastMonth])->sum('total_amount');

        $totalOrders = Order::count();
        $ordersThisMonth = Order::whereBetween('placed_at', [$startOfMonth, $now])->count();
        $ordersLastMonth = Order::whereBetween('placed_at', [$startOfLastMonth, $endOfLastMonth])->count();

        $totalCustomers = User::customers()->count();
        $customersThisMonth = User::customers()
            ->where('created_at', '>=', $startOfMonth)->count();

        $avgOrderValue = $totalOrders > 0
            ? round(Order::where('payment_status', 'paid')->avg('total_amount'), 2)
            : 0;

        // Month-over-month percentage changes
        $revenueChange = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;
        $ordersChange = $ordersLastMonth > 0
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')->get()->pluck('count', 'status');

        $categorySales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->leftJoin('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->selectRaw("COALESCE(categories.name, 'Uncategorized') as name, SUM(order_items.total) as revenue")
            ->groupBy('name')
            ->orderByDesc('revenue')
            ->get();
        $categoryTotal = (float) $categorySales->sum('revenue');
        $categorySales = $categorySales->map(fn($category, $index) => [
            'name' => $category->name,
            'revenue' => $category->revenue,
            'percentage' => $categoryTotal > 0 ? round(((float) $category->revenue / $categoryTotal) * 100, 1) : 0,
            'color' => ['#0f172a', '#4f46e5', '#0ea5e9', '#10b981'][$index % 4],
        ])->values();

        $activity = Order::recent()
            ->limit(5)
            ->get(['id', 'order_number', 'customer_name', 'total_amount', 'status', 'placed_at'])
            ->map(fn($order) => [
                'id' => $order->id,
                'title' => 'Order ' . $order->order_number,
                'desc' => $order->customer_name . ' placed an order worth ' . $order->total_amount,
                'time' => $order->placed_at?->diffForHumans(),
                'status' => ucfirst($order->status),
            ]);

        $orderTableFilter = $request->input('order_filter', 'all');

        // Keep dashboard tables small and navigable at the database level.
        $recentOrders = Order::with('items')
            ->when($orderTableFilter === 'unfulfilled', fn($q) => $q->whereIn('status', ['pending', 'processing']))
            ->when($orderTableFilter === 'pending', fn($q) => $q->where('payment_status', 'unpaid'))
            ->when($orderTableFilter === 'fulfilled', fn($q) => $q->where('status', 'delivered'))
            ->recent()
            ->paginate(10, ['*'], 'recent_page')
            ->withQueryString();

        $recentOrders->through(fn($o) => [
            'id' => $o->id,
            'order_number' => $o->order_number,
            'customer_name' => $o->customer_name,
            'customer_email' => $o->customer_email,
            'total_amount' => $o->total_amount,
            'status' => $o->status,
            'payment_status' => $o->payment_status,
            'placed_at' => $o->placed_at,
            'items_count' => $o->items->count(),
        ]);

        // Aggregate results are also paginated server-side.
        $topProducts = DB::table('order_items')
            ->select('product_name', DB::raw('SUM(quantity) as units_sold'), DB::raw('SUM(total) as revenue'))
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->paginate(5, ['*'], 'top_products_page')
            ->withQueryString();

        $lowStock = Product::where('stock_quantity', '<=', 10)
            ->where('is_active', true)
            ->select('id', 'name', 'slug', 'stock_quantity', 'price')
            ->orderBy('stock_quantity')
            ->paginate(8, ['*'], 'low_stock_page')
            ->withQueryString();

        /*
         * Keep the remaining analytics queries as aggregates; they do not render
         * row-based tables and therefore do not need browser-side pagination.
         */
        $recentOrders = $recentOrders;

        // Revenue over last 12 months
        $dateExpr = DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', placed_at)"
            : "DATE_FORMAT(placed_at, '%Y-%m')";

        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->where('placed_at', '>=', now()->subMonths(12))
            ->selectRaw("{$dateExpr} as month, SUM(total_amount) as revenue, COUNT(*) as orders")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $weeklyRevenue = Order::where('payment_status', 'paid')
            ->where('placed_at', '>=', now()->subDays(7))
            ->selectRaw("{$dateExpr} as day, SUM(total_amount) as revenue, COUNT(*) as orders")
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return Inertia::render('Admin/dashboard', [
            'stats' => [
                'totalRevenue' => round($totalRevenue, 2),
                'revenueThisMonth' => round($revenueThisMonth, 2),
                'revenueChange' => $revenueChange,
                'totalOrders' => $totalOrders,
                'ordersThisMonth' => $ordersThisMonth,
                'ordersChange' => $ordersChange,
                'totalCustomers' => $totalCustomers,
                'customersThisMonth' => $customersThisMonth,
                'avgOrderValue' => $avgOrderValue,
                'ordersByStatus' => $ordersByStatus,
            ],
            'categorySales' => $categorySales,
            'activity' => $activity,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'lowStock' => $lowStock,
            'monthlyRevenue' => $monthlyRevenue,
            'weeklyRevenue' => $weeklyRevenue,
            'orderTableFilter' => $orderTableFilter,
        ]);
    }
}