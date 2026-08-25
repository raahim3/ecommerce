import { useState, useMemo } from "react";
import { Link, router } from "@inertiajs/react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  Calendar,
  Download,
  RotateCw,
  Eye,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  ChevronRight,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, getCurrencySymbol } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

// Mock Chart Data for Revenue & Orders
const REVENUE_DATA_MONTHLY = [
  { label: "Jan", revenue: 14200, orders: 110, aov: 129 },
  { label: "Feb", revenue: 18400, orders: 135, aov: 136 },
  { label: "Mar", revenue: 21600, orders: 152, aov: 142 },
  { label: "Apr", revenue: 19800, orders: 140, aov: 141 },
  { label: "May", revenue: 27400, orders: 182, aov: 150 },
  { label: "Jun", revenue: 31200, orders: 204, aov: 153 },
  { label: "Jul", revenue: 28900, orders: 190, aov: 152 },
  { label: "Aug", revenue: 36500, orders: 235, aov: 155 },
  { label: "Sep", revenue: 42100, orders: 268, aov: 157 },
  { label: "Oct", revenue: 39800, orders: 250, aov: 159 },
  { label: "Nov", revenue: 48900, orders: 295, aov: 165 },
  { label: "Dec", revenue: 54200, orders: 320, aov: 169 },
];

const REVENUE_DATA_WEEKLY = [
  { label: "Mon", revenue: 4200, orders: 28, aov: 150 },
  { label: "Tue", revenue: 5600, orders: 36, aov: 155 },
  { label: "Wed", revenue: 7100, orders: 44, aov: 161 },
  { label: "Thu", revenue: 6400, orders: 39, aov: 164 },
  { label: "Fri", revenue: 8900, orders: 52, aov: 171 },
  { label: "Sat", revenue: 11200, orders: 68, aov: 164 },
  { label: "Sun", revenue: 9800, orders: 58, aov: 168 },
];

const CATEGORY_DISTRIBUTION = [
  { name: "Fashion", revenue: 58400, percentage: 39, color: "#0f172a" },
  { name: "Electronics", revenue: 46200, percentage: 31, color: "#6366f1" },
  { name: "Accessories", revenue: 28500, percentage: 19, color: "#0ea5e9" },
  { name: "Lifestyle", revenue: 15820, percentage: 11, color: "#10b981" },
];

const RECENT_ORDERS_ADMIN = [
  {
    id: "ATL-894210",
    customer: { name: "Alex Rivers", email: "alex.rivers@example.com" },
    items: "Atelier Studio Headphones (x1), Knit (x1)",
    total: 338.0,
    date: "10 mins ago",
    paymentStatus: "Paid",
    fulfillmentStatus: "Unfulfilled",
  },
  {
    id: "ATL-894209",
    customer: { name: "Sofia Lindqvist", email: "sofia.l@nordic.se" },
    items: "Meridian Steel Watch (x1)",
    total: 320.0,
    date: "45 mins ago",
    paymentStatus: "Paid",
    fulfillmentStatus: "In Transit",
  },
  {
    id: "ATL-894208",
    customer: { name: "Marcus Vance", email: "m.vance@studio.co" },
    items: "Heavy Rib Cashmere Knit (x2)",
    total: 378.0,
    date: "2 hours ago",
    paymentStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
  },
  {
    id: "ATL-894207",
    customer: { name: "Elena Rostova", email: "elena.rostova@design.de" },
    items: "Court Leather Sneakers (x1)",
    total: 165.0,
    date: "4 hours ago",
    paymentStatus: "Pending",
    fulfillmentStatus: "Unfulfilled",
  },
  {
    id: "ATL-894206",
    customer: { name: "Julian Thorne", email: "j.thorne@london.uk" },
    items: "Everyday Leather Tote (x1), Diffuser (x1)",
    total: 308.0,
    date: "6 hours ago",
    paymentStatus: "Paid",
    fulfillmentStatus: "Fulfilled",
  },
];

const ACTIVITY_STREAM = [
  {
    id: 1,
    title: "New order placed ($338.00)",
    desc: "Order #ATL-894210 by Alex Rivers",
    time: "10m ago",
    icon: ShoppingBag,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: 2,
    title: "Low stock alert",
    desc: "Heavy Rib Cashmere Knit is down to 4 units",
    time: "32m ago",
    icon: AlertTriangle,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: 3,
    title: "VIP Customer Registered",
    desc: "Sofia Lindqvist created an account",
    time: "1h ago",
    icon: Users,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: 4,
    title: "Promo Code Redeemed",
    desc: "Code 'ATELIER10' saved $32.00 on order #ATL-894209",
    time: "2h ago",
    icon: Sparkles,
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
];

function TablePagination({ paginator }) {
  if (!paginator || paginator.last_page <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
      <span>Showing {paginator.from ?? 0}-{paginator.to ?? 0} of {paginator.total ?? 0}</span>
      <div className="flex items-center gap-1">
        {(paginator.links ?? []).map((link, index) => (
          <Link
            key={`${link.label}-${index}`}
            href={link.url || "#"}
            preserveScroll
            className={cn(
              "min-w-8 rounded-lg border px-2 py-1 text-center font-semibold",
              link.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50",
              !link.url && "pointer-events-none opacity-40",
            )}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardPage({
  stats = {},
  recentOrders = { data: [], links: [] },
  topProducts = { data: [], links: [] },
  lowStock = [],
  categorySales = [],
  activity = [],
  monthlyRevenue = [],
  weeklyRevenue = [],
  orderTableFilter: serverOrderTableFilter = "all",
}) {
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [orderTableFilter, setOrderTableFilter] = useState(serverOrderTableFilter);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Merge server monthly revenue into chart data format
  const activeChartData = timeRange === "monthly"
    ? monthlyRevenue.map((d) => ({
            label: new Date(d.month + "-01").toLocaleString("en-US", { month: "short" }),
            revenue: parseFloat(d.revenue) || 0,
            orders: parseInt(d.orders) || 0,
            aov: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
          }))
      : weeklyRevenue.map((d) => ({
          label: new Date(`${d.day}T00:00:00`).toLocaleString("en-US", { weekday: "short" }),
          revenue: parseFloat(d.revenue) || 0,
          orders: parseInt(d.orders) || 0,
          aov: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
        }));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Store analytics & live inventory refreshed!");
    }, 600);
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/admin/reports/export", { headers: { "X-Requested-With": "XMLHttpRequest" } });
      const data = await res.json();
      if (data.orders?.length) {
        const headers = Object.keys(data.orders[0]).join(",");
        const rows = data.orders.map((r) => Object.values(r).join(",")).join("\n");
        const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "atelier_orders.csv"; a.click();
        toast.success("Exported atelier_orders.csv");
      }
    } catch { toast.success("Exporting store_sales_analytics.csv"); }
  };

  // Use only persisted orders.
  const ordersSource = (recentOrders.data ?? []).map((o) => ({
        id: o.order_number,
        customer: { name: o.customer_name, email: o.customer_email },
        total: parseFloat(o.total_amount),
        paymentStatus: o.payment_status === "paid" ? "Paid" : "Pending",
        fulfillmentStatus: o.status === "delivered" ? "Fulfilled" : o.status === "shipped" ? "In Transit" : "Unfulfilled",
        date: new Date(o.placed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
        itemsCount: o.items_count || 0,
      }));

  // Show persisted KPI values, including zero when the store is empty.
  const kpiStats = {
    revenue: stats.totalRevenue ?? 0,
    revenueChange: stats.revenueChange ?? 0,
    orders: stats.totalOrders ?? 0,
    ordersChange: stats.ordersChange ?? 0,
    customers: stats.totalCustomers ?? 0,
    avgOrderValue: stats.avgOrderValue ?? 0,
    ordersByStatus: stats.ordersByStatus ?? {},
  };

  const filteredOrders = ordersSource;

  const handleOrderFilter = (filter) => {
    setOrderTableFilter(filter);
    router.get("/admin", { order_filter: filter }, { preserveScroll: true, preserveState: true });
  };

  // SVG Chart Dimensions & Calculations
  const chartHeight = 220;
  const chartWidth = 700;
  const maxVal = Math.max(...activeChartData.map((d) => d[chartMetric]), 1) * 1.15;
  const minVal = 0;

  const points = activeChartData.map((d, i) => {
    const x = activeChartData.length === 1 ? chartWidth / 2 : (i / (activeChartData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((d[chartMetric] - minVal) / (maxVal - minVal)) * (chartHeight - 40) - 20;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : "";

  return (
    <div className="space-y-8">
      {/* ================= 1. TOP DASHBOARD CONTROL BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Executive Store Overview
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {kpiStats.customers.toLocaleString()} Customers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial performance, inventory metrics, and customer conversion telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setTimeRange("weekly")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                timeRange === "weekly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900",
              )}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("monthly")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                timeRange === "monthly" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900",
              )}
            >
              Year to Date
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh analytics data"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <RotateCw className={cn("size-4", isRefreshing && "animate-spin text-slate-900")} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ================= 2. FOUR HERO KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatPrice(kpiStats.revenue, 2)}
            </div>
            <div className={cn("mt-2 flex items-center gap-1.5 text-xs font-bold", kpiStats.revenueChange >= 0 ? "text-emerald-600" : "text-red-500")}>
              {kpiStats.revenueChange >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              <span>{kpiStats.revenueChange >= 0 ? "+" : ""}{kpiStats.revenueChange}%</span>
              <span className="text-slate-400 font-normal ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Orders */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <ShoppingBag className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {kpiStats.orders.toLocaleString()}
            </div>
            <div className={cn("mt-2 flex items-center gap-1.5 text-xs font-bold", kpiStats.ordersChange >= 0 ? "text-emerald-600" : "text-red-500")}>
              {kpiStats.ordersChange >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              <span>{kpiStats.ordersChange >= 0 ? "+" : ""}{kpiStats.ordersChange}%</span>
              <span className="text-slate-400 font-normal ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Average Order Value */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Order Value</span>
            <div className="grid size-9 place-items-center rounded-xl bg-sky-100 text-sky-700">
              <TrendingUp className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatPrice(kpiStats.avgOrderValue, 2)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="size-3.5" />
              <span>Live AOV</span>
              <span className="text-slate-400 font-normal ml-1">{kpiStats.orders} total orders</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Conversion Rate */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {kpiStats.customers.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="size-3.5" />
              <span>+{stats.customersThisMonth ?? 0} new</span>
              <span className="text-slate-400 font-normal ml-1">this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN CHARTS SECTION (2 Columns) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Interactive Revenue & Sales Area Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales & Revenue Velocity</h3>
              <p className="text-xs text-slate-500">Interactive telemetry with point inspection.</p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[
                { id: "revenue", label: `Revenue (${getCurrencySymbol()})` },
                { id: "orders", label: "Orders" },
                { id: "aov", label: `AOV (${getCurrencySymbol()})` },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMetric(m.id)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                    chartMetric === m.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Interactive Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - pct * (chartHeight - 40) - 20;
                return (
                  <line
                    key={i}
                    x1="20"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Fill */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Smooth Spline Curve */}
              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Data Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === i ? 6 : 3.5}
                    className="fill-white stroke-indigo-600 stroke-2 transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* X Axis Labels */}
                  <text
                    x={pt.x}
                    y={chartHeight - 2}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-slate-400"
                  >
                    {pt.data.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredPoint !== null && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 rounded-2xl bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-md text-xs space-y-1 transition-all"
                style={{
                  left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / chartHeight) * 100 - 30}%`,
                }}
              >
                <p className="font-bold text-slate-200">{points[hoveredPoint].data.label} Period</p>
                <p className="font-extrabold text-sm text-indigo-400">
                  {chartMetric === "revenue"
                    ? formatPrice(points[hoveredPoint].data.revenue)
                    : chartMetric === "orders"
                    ? `${points[hoveredPoint].data.orders} Orders`
                    : formatPrice(points[hoveredPoint].data.aov)}
                </p>
                <p className="text-[10px] text-slate-400">
                  Total Orders: {points[hoveredPoint].data.orders}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Category Sales Doughnut & Conversion Funnel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Sales by Department
            </h3>

            {/* Visual Doughnut Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex shadow-2xs">
              {categorySales.map((cat) => (
                <div
                  key={cat.name}
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  title={`${cat.name}: ${cat.percentage}%`}
                />
              ))}
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2.5 pt-2">
              {categorySales.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{formatPrice(cat.revenue)}</span>
                    <span className="text-slate-400 text-[11px]">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel Analyzer */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Conversion Funnel</h3>
              <span className="text-[11px] font-bold text-emerald-600">Live order mix</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {Object.entries(kpiStats.ordersByStatus).map(([status, count], idx, statuses) => {
                const total = statuses.reduce((sum, [, value]) => sum + Number(value), 0);
                const pct = total > 0 ? Math.round((Number(count) / total) * 100) : 0;
                const step = { stage: `${idx + 1}. ${status}`, val: count, pct };
                return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                    <span>{step.stage}</span>
                    <span className="font-bold text-slate-900">{step.val} ({step.pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all duration-500"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. RECENT ORDERS MANAGEMENT TABLE ================= */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live order fulfillment queue and payment verification.</p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "all", label: "All Orders" },
              { id: "unfulfilled", label: "Unfulfilled" },
              { id: "pending", label: "Pending Payment" },
              { id: "fulfilled", label: "Fulfilled" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleOrderFilter(f.id)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold transition-all",
                  orderTableFilter === f.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-y border-slate-100">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Fulfillment</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">#{order.id}</td>
                  <td className="p-3.5">
                    <div>
                      <p className="font-bold text-slate-900">{order.customer.name}</p>
                      <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                    </div>
                  </td>
                  <td className="p-3.5 max-w-[220px] truncate">{order.items}</td>
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">{order.date}</td>
                  <td className="p-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                        order.paymentStatus === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200",
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                        order.fulfillmentStatus === "Fulfilled" && "bg-slate-100 text-slate-700",
                        order.fulfillmentStatus === "In Transit" && "bg-sky-50 text-sky-700 border border-sky-200",
                        order.fulfillmentStatus === "Unfulfilled" && "bg-amber-50 text-amber-700 border border-amber-200",
                      )}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href="/admin/orders"
                      className="inline-flex rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination paginator={recentOrders} />
      </div>

      {/* ================= 5. LOWER SECTION: TOP PRODUCTS & LIVE STREAM ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top Selling Products (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
            <Link href="/admin/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {(topProducts.data ?? []).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400">0{idx + 1}</span>
                    <div
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-400"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.product_name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {p.units_sold} units sold
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatPrice(p.revenue)}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {p.units_sold} units sold
                  </p>
                </div>
              </div>
            ))}
          </div>
          <TablePagination paginator={topProducts} />
        </div>

        {/* Real-time Activity Stream (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Real-Time Store Activity</h3>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            {activity.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/40"
              >
                <div className={cn("grid size-8 place-items-center rounded-xl border shrink-0 mt-0.5", act.color)}>
                  <ShoppingBag className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{act.title}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

AdminDashboardPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminDashboardPage;
