import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  RotateCcw,
  FileText,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "This Quarter", "This Year", "All Time"];

export function AdminReportsPage({
  revenue = null,
  dailyRevenue = [],
  topProducts = [],
  couponStats = [],
  newCustomers = 0,
  uniqueCustomers = 0,
  refunds = 0,
  channelData = [],
  period = "30",
}) {
  const periodLabels = { "7": "Last 7 Days", "30": "Last 30 Days", "90": "This Quarter", "365": "This Year", all: "All Time" };
  const [dateRange, setDateRange] = useState(periodLabels[period] || "Last 30 Days");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);

  const defaultData = {
    grossSales: 0,
    discounts: 0,
    returns: parseFloat(refunds || 0),
    netSales: 0,
    shippingCollected: 0,
    taxes: 0,
    orderCount: 0,
    customerCount: 0,
    newCustomers: 0,
    avgOrder: 0,
    conversionRate: 0,
    topProducts: [],
    channelData: [],
    dailyRevenue: [],
    dailyLabels: [],
  };

  const totalRev = parseFloat(revenue?.total_revenue || 0);
  const totalDisc = parseFloat(revenue?.total_discounts || 0);
  const orderCnt = parseInt(revenue?.total_orders || 0);
  const avgVal = parseFloat(revenue?.avg_order_value || (orderCnt > 0 ? totalRev / orderCnt : 0));

  const data = revenue ? {
    grossSales: totalRev,
    discounts: totalDisc,
    returns: 0,
    netSales: totalRev - totalDisc,
    shippingCollected: parseFloat(revenue?.total_shipping || 0),
    taxes: parseFloat(revenue?.total_tax || 0),
    orderCount: orderCnt,
    customerCount: uniqueCustomers,
    newCustomers,
    avgOrder: avgVal,
    conversionRate: 0,
    topProducts: topProducts.length > 0
      ? topProducts.map((p) => ({
          name: p.product_name,
          sku: `ATL-${(p.product_name || "").slice(0, 3).toUpperCase()}-001`,
          units: parseInt(p.units_sold || 0),
          revenue: parseFloat(p.revenue || 0),
          category: "General",
        }))
      : [],
    channelData: channelData.map((channel) => ({
      channel: channel.channel,
      revenue: parseFloat(channel.revenue || 0),
      pct: Number(channel.pct || 0),
    })),
    dailyRevenue: dailyRevenue.map((d) => parseFloat(d.revenue || 0)),
    dailyLabels: dailyRevenue.map((d) => new Date(`${d.day}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
  } : defaultData;

  const handleExportPDF = () => {
    window.print();
    toast.success("Printing / Saving Financial Summary Report PDF...");
  };

  const handleDateRange = (range) => {
    const rangePeriods = { "Last 7 Days": "7", "Last 30 Days": "30", "This Quarter": "90", "This Year": "365", "All Time": "all" };
    setDateRange(range);
    router.get("/admin/reports", { period: rangePeriods[range] }, { preserveScroll: true, preserveState: true });
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/admin/reports/export", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const exportData = await res.json();
      if (exportData.orders?.length) {
        const headers = Object.keys(exportData.orders[0]).join(",");
        const rows = exportData.orders.map((r) => Object.values(r).join(",")).join("\n");
        const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `store_sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast.success("Downloaded store_sales_report.csv");
      } else {
        toast.info("No orders found for export.");
      }
    } catch {
      toast.success("Exporting raw analytics CSV data...");
    }
  };

  const chartValues = data.dailyRevenue || [];
  const chartMax = Math.max(...chartValues, 1);
  const chartWidth = 760;
  const chartHeight = 250;
  const chartPadding = { top: 18, right: 18, bottom: 34, left: 18 };
  const chartPoints = chartValues.map((value, index) => ({
    x: chartValues.length === 1
      ? chartWidth / 2
      : chartPadding.left + (index / (chartValues.length - 1)) * (chartWidth - chartPadding.left - chartPadding.right),
    y: chartPadding.top + (1 - value / chartMax) * (chartHeight - chartPadding.top - chartPadding.bottom),
    value,
  }));
  const chartLine = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const chartArea = chartPoints.length > 0
    ? `${chartLine} L ${chartPoints.at(-1).x} ${chartHeight - chartPadding.bottom} L ${chartPoints[0].x} ${chartHeight - chartPadding.bottom} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Financial Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Complete financial performance dashboard with live ledger and export capabilities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportPDF} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <FileText className="size-3.5" /> Export PDF
          </button>
          <button type="button" onClick={handleExportCSV} className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 w-fit shadow-xs">
        {DATE_RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => handleDateRange(range)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap",
              dateRange === range ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Financial Ledger Summary */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4">Financial Ledger Summary</h2>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Gross Sales", val: data.grossSales, color: "text-slate-900", bg: "bg-slate-50" },
            { label: "Discounts Applied", val: -data.discounts, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Returns & Refunds", val: -data.returns, color: "text-red-700", bg: "bg-red-50" },
            { label: "Net Sales", val: data.netSales, color: "text-emerald-700", bg: "bg-emerald-50", bold: true },
            { label: "Shipping Collected", val: data.shippingCollected, color: "text-sky-700", bg: "bg-sky-50" },
            { label: "Taxes Collected", val: data.taxes, color: "text-violet-700", bg: "bg-violet-50" },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-2xl p-4 text-center border", item.bg, item.bold ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200/60")}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className={cn("text-lg font-extrabold mt-1", item.color)}>{formatPrice(item.val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Revenue Chart & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bar Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Revenue Velocity</h2>
            <span className="text-xs text-slate-400 font-semibold">{dateRange}</span>
          </div>

          <div className="h-64 rounded-2xl border border-slate-100 bg-slate-50/40 px-2 py-3">
            {chartPoints.length === 0 ? (
              <div className="grid h-full place-items-center text-xs font-semibold text-slate-400">No revenue data for this period.</div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible" role="img" aria-label="Revenue over time">
                <defs>
                  <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0, 0.5, 1].map((ratio) => {
                  const y = chartPadding.top + ratio * (chartHeight - chartPadding.top - chartPadding.bottom);
                  return <line key={ratio} x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />;
                })}
                <path d={chartArea} fill="url(#revenueArea)" />
                <path d={chartLine} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((point, index) => (
                  <g key={index} onMouseEnter={() => setHoveredBar(index)} onMouseLeave={() => setHoveredBar(null)}>
                    <circle cx={point.x} cy={point.y} r={hoveredBar === index ? 7 : 5} fill="#fff" stroke="#4f46e5" strokeWidth="3" />
                    {hoveredBar === index && <text x={point.x} y={Math.max(12, point.y - 14)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">{formatPrice(point.value)}</text>}
                    {(chartPoints.length <= 10) && <text x={point.x} y={chartHeight - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">{data.dailyLabels?.[index] || `Day ${index + 1}`}</text>}
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* KPI Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { label: "Orders Placed", val: (data.orderCount ?? 0).toLocaleString(), icon: ShoppingBag, color: "text-violet-700 bg-violet-100" },
            { label: "Unique Customers", val: (data.customerCount ?? 0).toLocaleString(), icon: Users, color: "text-sky-700 bg-sky-100" },
            { label: "New Customers", val: (data.newCustomers ?? 0).toLocaleString(), icon: TrendingUp, color: "text-emerald-700 bg-emerald-100" },
            { label: "Average Order Value", val: formatPrice(data.avgOrder ?? 0), icon: DollarSign, color: "text-amber-700 bg-amber-100" },
            { label: "Conversion Rate", val: `${data.conversionRate ?? 0}%`, icon: BarChart3, color: "text-slate-700 bg-slate-100" },
          ].map((metric) => (
            <div key={metric.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className={cn("grid size-10 place-items-center rounded-xl", metric.color)}>
                <metric.icon className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{metric.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Channel Breakdown + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sales Channel (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Sales Channels</h2>

          {/* Combined Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex">
            {data.channelData.map((ch, i) => (
              <div
                key={ch.channel}
                style={{ width: `${ch.pct}%`, backgroundColor: ["#1e293b", "#6366f1", "#0ea5e9"][i] }}
                title={ch.channel}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setActiveChannel(i)}
                onMouseLeave={() => setActiveChannel(null)}
              />
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {data.channelData.map((ch, i) => (
              <div key={ch.channel} className={cn("flex items-center justify-between rounded-xl p-3 transition-colors text-xs", activeChannel === i ? "bg-slate-100" : "hover:bg-slate-50/50")}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: ["#1e293b", "#6366f1", "#0ea5e9"][i] }} />
                  <span className="font-semibold text-slate-700">{ch.channel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{formatPrice(ch.revenue)}</span>
                  <span className="text-slate-400 text-[10px]">({ch.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Top Performing SKUs</h2>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-right hidden sm:table-cell">Units Sold</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topProducts.map((p, i) => (
                <tr key={p.sku} className="hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-bold text-slate-400 w-6">0{i + 1}</td>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.category} • {p.sku}</p>
                  </td>
                  <td className="py-3 text-right hidden sm:table-cell font-semibold text-slate-600">{p.units}</td>
                  <td className="py-3 text-right font-extrabold text-slate-900">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

AdminReportsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminReportsPage;
