import { useState, useMemo } from "react";
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
  period = "30",
}) {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);

  const defaultData = {
    grossSales: 0,
    discounts: 0,
    returns: 0,
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
    customerCount: newCustomers,
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
    channelData: [],
    dailyRevenue: dailyRevenue.map((d) => parseFloat(d.revenue || 0)),
    dailyLabels: dailyRevenue.map((d) => d.day),
  } : defaultData;

  const handleExportPDF = () => {
    window.print();
    toast.success("Printing / Saving Financial Summary Report PDF...");
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

  const maxBarRevenue = Math.max(...(data.dailyRevenue || [1]));

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
            onClick={() => setDateRange(range)}
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

          <div className="h-56 flex items-end gap-2 pt-6 pb-2 px-2">
            {(data.dailyRevenue || []).map((val, i) => {
              const heightPct = maxBarRevenue > 0 ? (val / maxBarRevenue) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0 group relative cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  {hoveredBar === i && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 text-white text-[10px] font-bold px-2 py-1 whitespace-nowrap shadow-lg z-10">
                      {data.dailyLabels?.[i] || `Day ${i + 1}`}: {formatPrice(val)}
                    </div>
                  )}
                  <div
                    className={cn("w-full rounded-t-lg transition-all", hoveredBar === i ? "bg-indigo-600" : "bg-indigo-500/70")}
                    style={{ height: `${heightPct}%` }}
                  />
                  {(data.dailyRevenue?.length || 0) <= 10 && (
                    <span className="text-[9px] font-semibold text-slate-400 truncate">{data.dailyLabels?.[i] || `D${i + 1}`}</span>
                  )}
                </div>
              );
            })}
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
