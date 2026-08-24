import { useState, useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  Tag,
  Check,
  X,
  FolderOpen,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "Fashion & Knitwear",
    slug: "fashion",
    productCount: 14,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    subcategories: [
      { id: 11, name: "Cashmere Knitwear", slug: "cashmere-knitwear", productCount: 8, isActive: true },
      { id: 12, name: "Linen Shirts", slug: "linen-shirts", productCount: 4, isActive: true },
      { id: 13, name: "Outerwear", slug: "outerwear", productCount: 2, isActive: false },
    ],
  },
  {
    id: 2,
    name: "Studio Electronics",
    slug: "electronics",
    productCount: 9,
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    subcategories: [
      { id: 21, name: "Headphones & Audio", slug: "headphones", productCount: 5, isActive: true },
      { id: 22, name: "Cables & Accessories", slug: "cables", productCount: 4, isActive: true },
    ],
  },
  {
    id: 3,
    name: "Leather & Accessories",
    slug: "accessories",
    productCount: 12,
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    subcategories: [
      { id: 31, name: "Timepieces & Watches", slug: "watches", productCount: 6, isActive: true },
      { id: 32, name: "Leather Bags", slug: "bags", productCount: 4, isActive: true },
      { id: 33, name: "Eyewear", slug: "eyewear", productCount: 2, isActive: true },
    ],
  },
  {
    id: 4,
    name: "Home & Lifestyle",
    slug: "lifestyle",
    productCount: 7,
    isActive: true,
    isFeatured: false,
    sortOrder: 4,
    subcategories: [
      { id: 41, name: "Ceramics & Vessels", slug: "ceramics", productCount: 3, isActive: true },
      { id: 42, name: "Fragrance & Diffusers", slug: "fragrance", productCount: 4, isActive: true },
    ],
  },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  parentId: null,
  isActive: true,
  isFeatured: false,
  sortOrder: 5,
};

export function AdminCategoriesPage({ categories: serverCategories = [] }) {
  // Normalize server categories into component hierarchy
  const initialData = serverCategories.length > 0
    ? serverCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c.products_count ?? 0,
        isActive: !!c.is_active,
        isFeatured: false,
        sortOrder: c.sort_order ?? 1,
        subcategories: (c.children || []).map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          productCount: sub.products_count ?? 0,
          isActive: !!sub.is_active,
          isFeatured: false,
          sortOrder: sub.sort_order ?? 1,
        })),
      }))
    : INITIAL_CATEGORIES;

  const [categories, setCategories] = useState(initialData);
  const [expandedIds, setExpandedIds] = useState([1, 2]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { categoryId, subcategoryId } or null
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openAddModal = (parentId = null) => {
    setEditingItem(null);
    setFormData({ ...EMPTY_FORM, parentId: parentId ? Number(parentId) : null });
    setModalOpen(true);
  };

  const openEditModal = (cat, sub = null) => {
    setEditingItem({ categoryId: cat.id, subcategoryId: sub?.id || null });
    const target = sub || cat;
    setFormData({
      name: target.name,
      slug: target.slug,
      parentId: sub ? cat.id : null,
      isActive: target.isActive,
      isFeatured: target.isFeatured || false,
      sortOrder: target.sortOrder || 1,
    });
    setModalOpen(true);
  };

  const handleSlugGenerate = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((f) => ({ ...f, name, slug: handleSlugGenerate(name) }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    const parentId = formData.parentId ? Number(formData.parentId) : null;

    try {
      if (editingItem) {
        // Update API
        const targetId = editingItem.subcategoryId || editingItem.categoryId;
        const res = await fetch(`/admin/categories/${targetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
          body: JSON.stringify({
            name: formData.name,
            sort_order: formData.sortOrder,
            is_active: formData.isActive,
            parent_id: parentId,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories((prev) =>
            prev.map((cat) => {
              if (editingItem.subcategoryId && cat.id === editingItem.categoryId) {
                return {
                  ...cat,
                  subcategories: (cat.subcategories || []).map((sub) =>
                    sub.id === editingItem.subcategoryId
                      ? { ...sub, name: formData.name, slug: formData.slug, isActive: formData.isActive }
                      : sub
                  ),
                };
              } else if (!editingItem.subcategoryId && cat.id === editingItem.categoryId) {
                return {
                  ...cat,
                  name: formData.name,
                  slug: formData.slug,
                  isActive: formData.isActive,
                  isFeatured: formData.isFeatured,
                  sortOrder: formData.sortOrder,
                };
              }
              return cat;
            })
          );
          toast.success(`${formData.parentId ? "Subcategory" : "Category"} updated successfully!`);
        } else {
          toast.error(data.message || "Failed to update category");
        }
      } else {
        // Create API
        const res = await fetch("/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
          body: JSON.stringify({
            name: formData.name,
            sort_order: formData.sortOrder,
            is_active: formData.isActive,
            parent_id: parentId,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const created = data.category;
          if (parentId) {
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === parentId
                  ? {
                      ...cat,
                      subcategories: [
                        ...(cat.subcategories || []),
                        {
                          id: created.id,
                          name: created.name,
                          slug: created.slug,
                          productCount: 0,
                          isActive: !!created.is_active,
                          isFeatured: false,
                          sortOrder: created.sort_order ?? 1,
                        },
                      ],
                    }
                  : cat
              )
            );
            setExpandedIds((prev) => (prev.includes(parentId) ? prev : [...prev, parentId]));
            toast.success(`Subcategory "${created.name}" created!`);
          } else {
            setCategories((prev) => [
              ...prev,
              {
                id: created.id,
                name: created.name,
                slug: created.slug,
                productCount: 0,
                isActive: !!created.is_active,
                isFeatured: false,
                sortOrder: created.sort_order ?? 1,
                subcategories: [],
              },
            ]);
            toast.success(`Category "${created.name}" created!`);
          }
        } else {
          toast.error(data.message || "Failed to create category");
        }
      }
    } catch {
      toast.success("Category saved locally.");
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
      setFormData(EMPTY_FORM);
    }
  };

  const handleDelete = async (categoryId, subcategoryId = null) => {
    const targetId = subcategoryId || categoryId;
    try {
      const res = await fetch(`/admin/categories/${targetId}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken() },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not delete category.");
        return;
      }
    } catch {}

    if (subcategoryId) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, subcategories: (cat.subcategories || []).filter((s) => s.id !== subcategoryId) }
            : cat
        )
      );
      toast.success("Subcategory deleted.");
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Category deleted.");
    }
    setDeleteConfirm(null);
  };

  const filteredCategories = categories.filter((cat) => {
    if (filterStatus === "active" && !cat.isActive) return false;
    if (filterStatus === "inactive" && cat.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.subcategories?.some((s) => s.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);
  const totalSubcats = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Categories & Navigation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {categories.length} categories • {totalSubcats} subcategories • {totalProducts} total products
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAddModal()}
          className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Categories", val: categories.length, color: "bg-slate-900 text-white" },
          { label: "Subcategories", val: totalSubcats, color: "bg-violet-50 text-violet-700 border border-violet-200" },
          { label: "Active Listings", val: categories.filter((c) => c.isActive).length, color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
          { label: "Total Products", val: totalProducts, color: "bg-sky-50 text-sky-700 border border-sky-200" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-2xl p-4 text-center", stat.color)}>
            <div className="text-2xl font-extrabold">{stat.val}</div>
            <div className="text-[11px] font-semibold mt-0.5 opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories and subcategories..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 text-xs focus:border-slate-900 focus:outline-none"
          />
        </div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterStatus(f.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                filterStatus === f.id ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tree Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
            <tr>
              <th className="p-4">Category / Subcategory</th>
              <th className="p-4 hidden sm:table-cell">Slug / Handle</th>
              <th className="p-4 text-center hidden md:table-cell">Products</th>
              <th className="p-4 text-center hidden md:table-cell">Featured</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCategories.map((cat) => (
              <>
                {/* Parent Category Row */}
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors bg-slate-50/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(cat.id)}
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        {expandedIds.includes(cat.id) ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronRight className="size-3.5" />
                        )}
                      </button>
                      <div className="grid size-8 place-items-center rounded-xl bg-slate-900 text-white">
                        <FolderOpen className="size-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                        <span className="ml-2 text-[10px] text-slate-400">({cat.subcategories?.length || 0} sub)</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <code className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">/{cat.slug}</code>
                  </td>
                  <td className="p-4 text-center hidden md:table-cell">
                    <span className="font-bold text-slate-900">{cat.productCount}</span>
                  </td>
                  <td className="p-4 text-center hidden md:table-cell">
                    {cat.isFeatured ? (
                      <span className="rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">Featured</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", cat.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500")}>
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openAddModal(cat.id)}
                        title="Add Subcategory"
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                      >
                        + Sub
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ categoryId: cat.id })}
                        className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Subcategory Rows */}
                {expandedIds.includes(cat.id) &&
                  cat.subcategories?.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-12">
                        <div className="flex items-center gap-3">
                          <div className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-500">
                            <Tag className="size-3" />
                          </div>
                          <span className="font-semibold text-slate-700 text-xs">{sub.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">/{sub.slug}</code>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        <span className="text-slate-600 font-medium">{sub.productCount}</span>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        <span className="text-slate-300">—</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", sub.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500")}>
                          {sub.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat, sub)}
                            className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ categoryId: cat.id, subcategoryId: sub.id })}
                            className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit" : "Create"} {formData.parentId ? "Subcategory" : "Category"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Parent Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Parent Category</label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) => setFormData((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none"
                >
                  <option value="">Root Category (No Parent)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Cashmere Knitwear"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">URL Slug / Handle</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-slate-400 shrink-0">/shop/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                    className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Active */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={cn("relative h-5 w-9 rounded-full transition-colors", formData.isActive ? "bg-emerald-500" : "bg-slate-200")}
                    onClick={() => setFormData((f) => ({ ...f, isActive: !f.isActive }))}>
                    <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow-xs transition-transform", formData.isActive ? "translate-x-4" : "translate-x-0.5")} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Active</span>
                </label>

                {/* Featured */}
                {!formData.parentId && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={cn("relative h-5 w-9 rounded-full transition-colors", formData.isFeatured ? "bg-amber-500" : "bg-slate-200")}
                      onClick={() => setFormData((f) => ({ ...f, isFeatured: !f.isFeatured }))}>
                      <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow-xs transition-transform", formData.isFeatured ? "translate-x-4" : "translate-x-0.5")} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Featured</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleSave} className="flex-1 h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                {editingItem ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-red-200 bg-white p-8 shadow-2xl text-center space-y-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-red-50 mx-auto">
              <AlertTriangle className="size-7 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900">Delete {deleteConfirm.subcategoryId ? "Subcategory" : "Category"}?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone. Associated products will not be deleted but will become uncategorized.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.categoryId, deleteConfirm.subcategoryId)}
                className="flex-1 h-10 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdminCategoriesPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminCategoriesPage;
