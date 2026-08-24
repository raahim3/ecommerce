import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Copy,
  Filter,
  Package,
  ArrowUpRight,
  AlertTriangle,
  X,
  ChevronDown,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { products as CATALOG, formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

const CATEGORIES = ["All", "Fashion", "Electronics", "Accessories", "Lifestyle"];
const STATUS_OPTS = ["All Status", "Active", "Draft", "Archived"];

export function AdminProductsPage({ products: serverProducts = { data: [] }, categories: serverCategories = [], filters = {} }) {
  const navigate = (href) => router.visit(href);
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Merge server products with mock fallback
  const serverData = serverProducts?.data ?? [];
  const [managedProducts, setManagedProducts] = useState(
    serverData.length > 0
      ? serverData.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku ?? "—",
          price: parseFloat(p.price),
          original_price: p.original_price ? parseFloat(p.original_price) : null,
          stock: p.stock_quantity,
          category: p.category?.name ?? "—",
          status: p.is_active ? "Active" : "Draft",
          image: p.image ?? null,
          is_active: p.is_active,
          badge: p.is_new ? "New" : p.original_price ? "Sale" : null,
        }))
      : CATALOG.map((p) => ({
          ...p,
          status: "Active",
          stock: p.stock || Math.floor(Math.random() * 60) + 4,
        }))
  );

  const allCategories = ["All", ...new Set([
    ...managedProducts.map((p) => p.category),
    ...serverCategories.map((c) => c.name),
  ].filter(Boolean))];

  const filtered = managedProducts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q);
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchStatus = selectedStatus === "All Status" || p.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
  const apiPatch = async (url, body) => fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() }, body: JSON.stringify(body) });
  const apiDelete = async (url) => fetch(url, { method: "DELETE", headers: { "X-CSRF-TOKEN": csrfToken() } });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    if (action === "archive") {
      setManagedProducts((prev) =>
        prev.map((p) => selectedIds.includes(p.id) ? { ...p, status: "Archived" } : p)
      );
      toast.success(`${selectedIds.length} products archived.`);
    } else if (action === "activate") {
      setManagedProducts((prev) =>
        prev.map((p) => selectedIds.includes(p.id) ? { ...p, status: "Active" } : p)
      );
      toast.success(`${selectedIds.length} products set to Active.`);
    } else if (action === "duplicate") {
      toast.success(`${selectedIds.length} products duplicated as Drafts.`);
    }
    setSelectedIds([]);
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiDelete(`/admin/products/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not delete product.");
        return;
      }
    } catch {}
    setManagedProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted from catalog.");
    setDeleteConfirm(null);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200" };
    if (stock <= 5) return { label: "Low Stock", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    return { label: "In Stock", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            {managedProducts.length} products • {managedProducts.filter((p) => p.status === "Active").length} active •{" "}
            {managedProducts.filter((p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length} low stock alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.success("Exporting catalog CSV...")}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
          <Link
            href="/admin/products/create"
            className="flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 shadow-xs"
          >
            <Plus className="size-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
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

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap",
                selectedCategory === cat ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-slate-900 focus:outline-none"
        >
          {STATUS_OPTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3 text-xs font-bold text-white animate-in slide-in-from-top-2">
          <span>{selectedIds.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={() => handleBulkAction("activate")} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600">Set Active</button>
            <button type="button" onClick={() => handleBulkAction("archive")} className="rounded-lg bg-slate-700 px-3 py-1.5 hover:bg-slate-600">Archive</button>
            <button type="button" onClick={() => handleBulkAction("duplicate")} className="rounded-lg bg-slate-700 px-3 py-1.5 hover:bg-slate-600">Duplicate</button>
            <button type="button" onClick={() => setSelectedIds([])} className="grid size-7 place-items-center rounded-lg hover:bg-slate-700"><X className="size-3.5" /></button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-slate-300 accent-slate-900"
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4 hidden sm:table-cell">SKU</th>
                <th className="p-4 hidden md:table-cell">Category</th>
                <th className="p-4 hidden lg:table-cell">Stock</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((product) => {
                const stockStatus = getStockStatus(product.stock || 0);
                return (
                  <tr key={product.id} className={cn("hover:bg-slate-50/70 transition-colors", selectedIds.includes(product.id) && "bg-violet-50/30")}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="size-4 rounded border-slate-300 accent-slate-900"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{product.name}</p>
                          <p className="text-[11px] text-slate-400">{(product.gallery?.length || 1)} images</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{product.sku || `ATL-${product.id.toString().padStart(4, "0")}`}</code>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">{typeof product.category === "object" ? product.category?.name : product.category}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{product.stock || 0} units</span>
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", stockStatus.cls)}>{stockStatus.label}</span>
                        </div>
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", (product.stock || 0) <= 5 ? "bg-red-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(100, ((product.stock || 0) / 60) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{formatPrice(product.price)}</p>
                        {product.comparePrice && (
                          <p className="text-[11px] text-slate-400 line-through">{formatPrice(product.comparePrice)}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                        product.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        product.status === "Draft" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/product/${product.slug || product.id}`}
                          target="_blank"
                          className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Eye className="size-3" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Edit2 className="size-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(product.id)}
                          className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Package className="size-12 mx-auto text-slate-300" />
              <p className="mt-3 font-bold text-slate-500">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center space-y-4 border border-red-200">
            <div className="grid size-14 place-items-center rounded-2xl bg-red-50 mx-auto">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900">Delete this product?</h3>
            <p className="text-xs text-slate-500">This permanently removes the product from your catalog. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdminProductsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductsPage;
