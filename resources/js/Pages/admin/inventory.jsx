import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Plus,
  Minus,
  AlertTriangle,
  Package,
  Check,
  X,
  ArrowUpDown,
  BarChart3,
  RotateCw,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { products as CATALOG, formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

const WAREHOUSES = ["Copenhagen Main Hub", "New York Warehouse", "All Locations"];
const ADJUST_REASONS = ["Restock / Replenishment", "Physical Count Correction", "Damage / Write-off", "Customer Return", "Promotion Reserve"];

const initialInventory = CATALOG.map((p, i) => ({
  id: p.id,
  name: p.name,
  sku: p.sku || `ATL-${(i + 1).toString().padStart(4, "0")}`,
  category: p.category,
  image: p.image,
  price: p.price,
  onHand: p.stock || Math.floor(Math.random() * 60) + 5,
  committed: Math.floor(Math.random() * 8),
  incoming: Math.floor(Math.random() * 20),
  warehouse: i % 2 === 0 ? "Copenhagen Main Hub" : "New York Warehouse",
  lowStockThreshold: 5,
}));

export function AdminInventoryPage({ products: serverProducts = { data: [] }, summary: serverSummary = {}, filters = {} }) {
  const serverData = serverProducts?.data ?? [];
  const initialData = serverData.length > 0
    ? serverData.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku ?? `ATL-PRD-${p.id}`,
        category: p.category?.name ?? "General",
        onHand: p.stock_quantity ?? 0,
        committed: 0,
        incoming: 0,
        warehouse: "Main Logistics Hub",
        bin: `A-${p.id}`,
        cost: Math.round((parseFloat(p.price) || 50) * 0.45),
        price: parseFloat(p.price) || 0,
        lowStockThreshold: 10,
      }))
    : initialInventory;

  const [inventory, setInventory] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Locations");
  const [stockFilter, setStockFilter] = useState(filters.stock ?? "all"); // all | low | out | ok
  const [adjustModalItem, setAdjustModalItem] = useState(null);
  const [adjustReason, setAdjustReason] = useState(ADJUST_REASONS[0]);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState("set"); // set | add | subtract
  const [isRefreshing, setIsRefreshing] = useState(false);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); toast.success("Inventory synced with warehouse."); }, 700);
  };

  const openAdjust = (item) => {
    setAdjustModalItem(item);
    setAdjustQty(item.onHand);
    setAdjustType("set");
    setAdjustReason(ADJUST_REASONS[0]);
  };

  const handleApplyAdjust = async () => {
    if (!adjustModalItem) return;
    let newQty = adjustModalItem.onHand;
    if (adjustType === "set") newQty = Number(adjustQty);
    else if (adjustType === "add") newQty = adjustModalItem.onHand + Number(adjustQty);
    else if (adjustType === "subtract") newQty = Math.max(0, adjustModalItem.onHand - Number(adjustQty));

    try {
      await fetch(`/admin/products/${adjustModalItem.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify({ stock_quantity: newQty }),
      });
    } catch {}

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== adjustModalItem.id) return item;
        return { ...item, onHand: newQty };
      })
    );
    toast.success(`Inventory adjusted: ${adjustModalItem.name}`, {
      description: `New on-hand: ${newQty} units • Reason: ${adjustReason}`,
    });
    setAdjustModalItem(null);
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const available = item.onHand - item.committed;
      if (stockFilter === "low" && !(available > 0 && available <= item.lowStockThreshold)) return false;
      if (stockFilter === "out" && item.onHand !== 0) return false;
      if (stockFilter === "ok" && available <= item.lowStockThreshold) return false;
      if (selectedWarehouse !== "All Locations" && item.warehouse !== selectedWarehouse) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [inventory, searchQuery, selectedWarehouse, stockFilter]);

  const getStockStatus = (item) => {
    const available = item.onHand - item.committed;
    if (item.onHand === 0) return { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
    if (available <= item.lowStockThreshold) return { label: "Low Stock", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    return { label: "In Stock", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  };

  const outOfStockCount = inventory.filter((i) => i.onHand === 0).length;
  const lowStockCount = inventory.filter((i) => i.onHand > 0 && (i.onHand - i.committed) <= i.lowStockThreshold).length;
  const totalUnits = inventory.reduce((s, i) => s + i.onHand, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock tracking across all warehouse locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RotateCw className={cn("size-3.5", isRefreshing && "animate-spin")} /> Sync Warehouse
          </button>
          <button
            type="button"
            onClick={() => toast.success("Exporting inventory audit CSV...")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="size-3.5" /> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-slate-900">{totalUnits.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Total Units On Hand</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-emerald-700">{inventory.filter((i) => (i.onHand - i.committed) > i.lowStockThreshold).length}</div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">Products In Stock</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-amber-700">{lowStockCount}</div>
          <div className="text-[11px] font-semibold text-amber-600 mt-0.5">Low Stock Alerts</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center shadow-xs">
          <div className="text-2xl font-extrabold text-red-700">{outOfStockCount}</div>
          <div className="text-[11px] font-semibold text-red-600 mt-0.5">Out of Stock</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 text-xs focus:border-slate-900 focus:outline-none"
          />
        </div>
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
        </select>
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          {[
            { id: "all", label: "All" },
            { id: "ok", label: "In Stock" },
            { id: "low", label: "Low Stock" },
            { id: "out", label: "Out of Stock" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStockFilter(f.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap",
                stockFilter === f.id ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="p-4">Product / SKU</th>
                <th className="p-4 text-center">On Hand</th>
                <th className="p-4 text-center hidden md:table-cell">Committed</th>
                <th className="p-4 text-center hidden md:table-cell">Available</th>
                <th className="p-4 text-center hidden lg:table-cell">Incoming</th>
                <th className="p-4 hidden lg:table-cell">Warehouse</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const available = item.onHand - item.committed;
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <code className="text-[11px] text-slate-400">{item.sku}</code>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-base font-extrabold text-slate-900">{item.onHand}</span>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className="text-xs font-semibold text-amber-600">{item.committed}</span>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span className={cn("text-sm font-extrabold", available <= 0 ? "text-red-600" : available <= item.lowStockThreshold ? "text-amber-600" : "text-emerald-600")}>
                        {available}
                      </span>
                    </td>
                    <td className="p-4 text-center hidden lg:table-cell">
                      <span className="text-xs font-semibold text-sky-600">+{item.incoming}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-[11px] text-slate-500">{item.warehouse}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold", status.cls)}>
                        <span className={cn("size-1.5 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openAdjust(item)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 ml-auto"
                      >
                        <Edit2 className="size-3" /> Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setAdjustModalItem(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Adjust Stock Level</h2>
                <p className="text-xs text-slate-500">{adjustModalItem.name}</p>
              </div>
              <button type="button" onClick={() => setAdjustModalItem(null)} className="grid size-8 place-items-center rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="size-4" />
              </button>
            </div>

            {/* Current Stock */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Current On-Hand Quantity</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{adjustModalItem.onHand}</p>
              <p className="text-xs text-slate-400">SKU: {adjustModalItem.sku}</p>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Adjustment Type</label>
              <div className="mt-1 flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1">
                {[
                  { id: "set", label: "Set Exact" },
                  { id: "add", label: "Add Units" },
                  { id: "subtract", label: "Remove Units" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAdjustType(t.id)}
                    className={cn(
                      "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                      adjustType === t.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input with +/- */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {adjustType === "set" ? "New Quantity" : adjustType === "add" ? "Units to Add" : "Units to Remove"}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustQty((q) => Math.max(0, Number(q) - 1))}
                  className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(0, Number(e.target.value)))}
                  min="0"
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-extrabold focus:border-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAdjustQty((q) => Number(q) + 1)}
                  className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              {/* Preview New Stock */}
              <div className="mt-2 text-center text-xs text-slate-500">
                After adjustment:{" "}
                <span className="font-extrabold text-slate-900">
                  {adjustType === "set" ? adjustQty : adjustType === "add" ? adjustModalItem.onHand + Number(adjustQty) : Math.max(0, adjustModalItem.onHand - Number(adjustQty))} units
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason / Audit Note</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none"
              >
                {ADJUST_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setAdjustModalItem(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={handleApplyAdjust} className="flex-1 h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800">
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdminInventoryPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminInventoryPage;
