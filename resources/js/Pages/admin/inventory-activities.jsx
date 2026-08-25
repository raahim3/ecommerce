import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ArrowLeft, Search, BarChart3 } from "lucide-react";
import { AdminLayout } from "@/layouts/admin-layout";
import { AdminPagination } from "@/components/admin/pagination";
import { cn } from "@/lib/utils";

export function AdminInventoryActivitiesPage({ logs = { data: [] }, filters = {} }) {
  const [search, setSearch] = useState(filters.search ?? "");
  const entries = logs.data ?? [];

  const submitSearch = (value) => {
    setSearch(value);
    router.get("/admin/inventory/activities", { search: value || undefined }, { preserveState: true, preserveScroll: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/inventory" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-3.5" /> Back to Inventory
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Inventory Activities</h1>
          <p className="mt-1 text-xs text-slate-500">Complete audit history of stock adjustments.</p>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white">
          <BarChart3 className="size-5" />
        </div>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submitSearch(event.currentTarget.value)}
          placeholder="Search by product name or SKU..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs focus:border-slate-900 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Previous</th>
                <th className="p-4">New Quantity</th>
                <th className="p-4">Change</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {entries.length === 0 ? (
                <tr><td colSpan="7" className="p-12 text-center text-slate-400">No inventory activities found.</td></tr>
              ) : entries.map((log) => {
                const change = Number(log.new_quantity) - Number(log.previous_quantity);
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-4"><p className="font-bold text-slate-900">{log.product?.name ?? "Deleted product"}</p><code className="text-[10px] text-slate-400">{log.product?.sku ?? ""}</code></td>
                    <td className="p-4">{log.user?.name ?? "System"}</td>
                    <td className="p-4">{log.previous_quantity}</td>
                    <td className="p-4 font-bold text-slate-900">{log.new_quantity}</td>
                    <td className={cn("p-4 font-bold", change >= 0 ? "text-emerald-600" : "text-red-600")}>{change >= 0 ? "+" : ""}{change}</td>
                    <td className="p-4">{log.reason || log.adjustment_type}</td>
                    <td className="whitespace-nowrap p-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4"><AdminPagination paginator={logs} /></div>
      </div>
    </div>
  );
}

AdminInventoryActivitiesPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminInventoryActivitiesPage;
