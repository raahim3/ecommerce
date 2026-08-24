<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', '30'); // days

        $startDate = now()->subDays((int) $period);

        // Revenue summary for the period
        $revenue = Order::where('payment_status', 'paid')
            ->where('placed_at', '>=', $startDate)
            ->selectRaw('
                SUM(total_amount) as total_revenue,
                SUM(discount_amount) as total_discounts,
                SUM(tax_amount) as total_tax,
                SUM(shipping_amount) as total_shipping,
                COUNT(*) as total_orders,
                AVG(total_amount) as avg_order_value
            ')->first();

        // Daily revenue chart data
        $dayExpr = DB::getDriverName() === 'sqlite'
            ? "date(placed_at)"
            : "DATE_FORMAT(placed_at, '%Y-%m-%d')";

        $dailyRevenue = Order::where('payment_status', 'paid')
            ->where('placed_at', '>=', $startDate)
            ->selectRaw("{$dayExpr} as day, SUM(total_amount) as revenue, COUNT(*) as orders")
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Top products by revenue
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.placed_at', '>=', $startDate)
            ->where('orders.payment_status', 'paid')
            ->select(
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total) as revenue')
            )
            ->groupBy('order_items.product_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        // Coupon usage stats
        $couponStats = Order::where('placed_at', '>=', $startDate)
            ->whereNotNull('coupon_code')
            ->selectRaw('coupon_code, COUNT(*) as uses, SUM(discount_amount) as total_discount')
            ->groupBy('coupon_code')
            ->orderByDesc('uses')
            ->get();

        // New customers in period
        $newCustomers = User::customers()
            ->where('created_at', '>=', $startDate)->count();

        return Inertia::render('Admin/reports', [
            'revenue' => $revenue,
            'dailyRevenue' => $dailyRevenue,
            'topProducts' => $topProducts,
            'couponStats' => $couponStats,
            'newCustomers' => $newCustomers,
            'period' => $period,
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        // Returns data for CSV export
        $orders = Order::with('items')
            ->where('payment_status', 'paid')
            ->recent()
            ->limit(500)
            ->get()
            ->map(fn($o) => [
                'order_number' => $o->order_number,
                'customer' => $o->customer_name,
                'email' => $o->customer_email,
                'total' => $o->total_amount,
                'status' => $o->status,
                'payment' => $o->payment_status,
                'date' => $o->placed_at->format('Y-m-d H:i'),
            ]);

        return response()->json(['success' => true, 'orders' => $orders]);
    }
}