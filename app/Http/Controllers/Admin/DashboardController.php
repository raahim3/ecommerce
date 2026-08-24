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
    public function index(): Response
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

        // Recent orders (last 10)
        $recentOrders = Order::with('items')
            ->recent()
            ->limit(10)
            ->get()
            ->map(fn($o) => [
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

        // Top selling products
        $topProducts = DB::table('order_items')
            ->select('product_name', DB::raw('SUM(quantity) as units_sold'), DB::raw('SUM(total) as revenue'))
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        // Low stock alerts
        $lowStock = Product::where('stock_quantity', '<=', 10)
            ->where('is_active', true)
            ->select('id', 'name', 'slug', 'stock_quantity', 'price')
            ->orderBy('stock_quantity')
            ->limit(8)
            ->get();

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
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'lowStock' => $lowStock,
            'monthlyRevenue' => $monthlyRevenue,
        ]);
    }
}