import { useState, useMemo, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  Plus,
  Search,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
  X,
  Tag,
  AlertCircle,
  HelpCircle,
  Eye,
  RefreshCw,
  FolderOpen,
  PieChart,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, getCurrencySymbol } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";
import { AdminPagination } from "@/components/admin/pagination";

const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "credit_card", label: "Credit Card" },
  { id: "cash", label: "Cash" },
  { id: "paypal", label: "PayPal" },
  { id: "other", label: "Other" },
];

const PRESET_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Rose
  "#64748B", // Slate
];

const DATE_PRESETS = [
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "this_year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" },
];

export default function AdminExpensesPage({
  expenses = { data: [], links: [] },
  categories = [],
  stats = {},
  categoryBreakdown = [],
  filters = {},
}) {
  const { props } = usePage();
  const storeCurrency = props?.app_settings?.general?.currency || "USD — US Dollar";
  const currencyCode = String(storeCurrency).split(" ")[0].toUpperCase();
  const currencySymbol = getCurrencySymbol(storeCurrency);

  // Filter states
  const [search, setSearch] = useState(filters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(filters.category_id || "all");
  const [selectedStatus, setSelectedStatus] = useState(filters.payment_status || "all");
  const [selectedMethod, setSelectedMethod] = useState(filters.payment_method || "all");
  const [datePreset, setDatePreset] = useState(filters.date_preset || "this_month");
  const [startDate, setStartDate] = useState(filters.start_date || "");
  const [endDate, setEndDate] = useState(filters.end_date || "");

  // Modal states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'expense' | 'category', id, title }
  const [isUploading, setIsUploading] = useState(false);

  // Form states for Expense
  const defaultExpenseForm = {
    title: "",
    expense_category_id: categories.length > 0 ? categories[0].id : "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "bank_transfer",
    payment_status: "paid",
    vendor_name: "",
    reference_number: "",
    receipt_url: "",
    notes: "",
  };
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm);

  // Form states for Category
  const defaultCategoryForm = {
    name: "",
    color: "#6366F1",
    monthly_budget: "",
    description: "",
  };
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);

  const fileInputRef = useRef(null);

  // Apply filters via Inertia visit
  const applyFilters = (overrides = {}) => {
    const currentParams = {
      search,
      category_id: selectedCategory,
      payment_status: selectedStatus,
      payment_method: selectedMethod,
      date_preset: datePreset,
      start_date: startDate,
      end_date: endDate,
      ...overrides,
    };

    // Clean up empty params
    const cleanParams = {};
    Object.keys(currentParams).forEach((key) => {
      if (currentParams[key] && currentParams[key] !== "all") {
        cleanParams[key] = currentParams[key];
      }
    });

    if (currentParams.date_preset && currentParams.date_preset !== "all") {
      cleanParams.date_preset = currentParams.date_preset;
    }

    router.get("/admin/expenses", cleanParams, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedMethod("all");
    setDatePreset("this_month");
    setStartDate("");
    setEndDate("");
    router.get("/admin/expenses", { date_preset: "this_month" }, { preserveScroll: true });
  };

  // Handle Receipt Upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "expenses");

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const res = await fetch("/admin/api/upload", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setExpenseForm((prev) => ({ ...prev, receipt_url: data.url }));
        toast.success("Receipt uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload receipt.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Open Expense Modal (Add / Edit)
  const openAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      ...defaultExpenseForm,
      expense_category_id: categories[0]?.id || "",
    });
    setIsAddExpenseOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title,
      expense_category_id: expense.expense_category_id,
      amount: expense.amount,
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
      payment_status: expense.payment_status,
      vendor_name: expense.vendor_name || "",
      reference_number: expense.reference_number || "",
      receipt_url: expense.receipt_url || "",
      notes: expense.notes || "",
    });
    setIsAddExpenseOpen(true);
  };

  // Submit Expense Form
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.expense_category_id) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (editingExpense) {
      router.patch(`/admin/expenses/${editingExpense.id}`, expenseForm, {
        onSuccess: () => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
          toast.success("Expense updated successfully.");
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] || "Failed to update expense.");
        },
      });
    } else {
      router.post("/admin/expenses", expenseForm, {
        onSuccess: () => {
          setIsAddExpenseOpen(false);
          toast.success("Expense recorded successfully.");
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] || "Failed to record expense.");
        },
      });
    }
  };

  // Submit Category Form
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      toast.error("Category name is required.");
      return;
    }

    if (editingCategory) {
      router.patch(`/admin/expenses/categories/${editingCategory.id}`, categoryForm, {
        onSuccess: () => {
          setEditingCategory(null);
          setCategoryForm(defaultCategoryForm);
          toast.success("Category updated.");
        },
        onError: (err) => toast.error(Object.values(err)[0] || "Failed to update."),
      });
    } else {
      router.post("/admin/expenses/categories", categoryForm, {
        onSuccess: () => {
          setCategoryForm(defaultCategoryForm);
          toast.success("Category added.");
        },
        onError: (err) => toast.error(Object.values(err)[0] || "Failed to create category."),
      });
    }
  };

  // Delete Handlers
  const confirmDeleteAction = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "expense") {
      router.delete(`/admin/expenses/${deleteConfirm.id}`, {
        onSuccess: () => {
          setDeleteConfirm(null);
          toast.success("Expense deleted.");
        },
      });
    } else if (deleteConfirm.type === "category") {
      router.delete(`/admin/expenses/categories/${deleteConfirm.id}`, {
        onSuccess: () => {
          setDeleteConfirm(null);
          toast.success("Category deleted.");
        },
        onError: (err) => {
          toast.error(Object.values(err)[0] || "Cannot delete category.");
        },
      });
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const params = new URLSearchParams({
      search,
      category_id: selectedCategory,
      payment_status: selectedStatus,
      payment_method: selectedMethod,
      start_date: startDate,
      end_date: endDate,
    });
    window.location.href = `/admin/expenses/export?${params.toString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Receipt className="size-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Expense Management
                </h1>
                <p className="text-xs text-slate-500">
                  Track company outlays, analyze category burn, and calculate business net profit.
                </p>
              </div>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Download className="size-4 text-slate-400" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Tag className="size-4 text-slate-400" />
              Categories ({categories.length})
            </button>
            <button
              type="button"
              onClick={openAddExpense}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Record Expense
            </button>
          </div>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Filtered Expenses */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Expenses</span>
              <div className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatPrice(stats.totalExpenses ?? 0)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Paid: {formatPrice(stats.paidExpenses ?? 0)}
            </p>
          </div>

          {/* This Month's Spend */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">This Month Burn</span>
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-lg",
                  stats.expenseMoMChange > 0
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                )}
              >
                {stats.expenseMoMChange > 0 ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatPrice(stats.thisMonthExpenses ?? 0)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold",
                  stats.expenseMoMChange > 0 ? "text-rose-600" : "text-emerald-600"
                )}
              >
                {stats.expenseMoMChange > 0 ? `+${stats.expenseMoMChange}%` : `${stats.expenseMoMChange}%`}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Last month: {formatPrice(stats.lastMonthExpenses ?? 0)}
            </p>
          </div>

          {/* Pending Invoices / Payments */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Payables</span>
              <div className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {formatPrice(stats.pendingAmount ?? 0)}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {stats.pendingCount ?? 0} due
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Awaiting settlement
            </p>
          </div>

          {/* Estimated Net Profit */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Est. Net Profit</span>
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-lg",
                  stats.netProfit >= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                )}
              >
                <Sparkles className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-extrabold",
                  stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
                )}
              >
                {formatPrice(stats.netProfit ?? 0)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold",
                  stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
                )}
              >
                {stats.profitMargin}% margin
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Revenue: {formatPrice(stats.periodRevenue ?? 0)}
            </p>
          </div>
        </div>

        {/* Category Spending Breakdown Bar */}
        {categoryBreakdown.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Spending Distribution</h3>
                <p className="text-xs text-slate-500">
                  Visual breakdown of outlays across active categories for this filter period.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {categoryBreakdown.length} active categories
              </span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
              {categoryBreakdown.map((item, idx) => (
                <div
                  key={item.category_id || idx}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-80"
                  style={{
                    width: `${Math.max(item.percentage, 2)}%`,
                    backgroundColor: item.color || "#64748B",
                  }}
                  title={`${item.name}: ${formatPrice(item.total_amount)} (${item.percentage}%)`}
                />
              ))}
            </div>

            {/* Category Badges / Legends */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {categoryBreakdown.map((item) => (
                <button
                  key={item.category_id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(item.category_id.toString());
                    applyFilters({ category_id: item.category_id.toString() });
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs transition",
                    selectedCategory === item.category_id.toString()
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold">{item.name}</span>
                  <span className="opacity-70 font-mono text-[11px]">
                    {formatPrice(item.total_amount)}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">
                    ({item.percentage}%)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Search expense title, vendor, reference..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                applyFilters({ category_id: e.target.value });
              }}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                applyFilters({ payment_status: e.target.value });
              }}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>

            {/* Payment Method Dropdown */}
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                applyFilters({ payment_method: e.target.value });
              }}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>

            {/* Date Preset Dropdown */}
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                applyFilters({ date_preset: e.target.value });
              }}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-700 font-semibold focus:border-slate-900 focus:bg-white focus:outline-none"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Filter Apply & Reset Buttons */}
            <button
              type="button"
              onClick={() => applyFilters()}
              className="h-9 rounded-xl bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          {/* Custom Date Range Picker inputs (visible only when custom is picked) */}
          {datePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-medium">Custom Range:</span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="h-8 rounded-lg bg-slate-900 px-2.5 text-xs font-medium text-white"
              >
                Filter Dates
              </button>
            </div>
          )}
        </div>

        {/* Expenses Data Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Expense & Vendor</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Payment Details</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-center">Receipt</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.data?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="mx-auto flex max-w-xs flex-col items-center">
                        <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400 mb-3">
                          <Receipt className="size-6" />
                        </div>
                        <p className="font-semibold text-slate-700">No expenses found</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try adjusting your search criteria or record a new expense.
                        </p>
                        <button
                          type="button"
                          onClick={openAddExpense}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                        >
                          <Plus className="size-3.5" />
                          Record First Expense
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.data.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/60">
                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar className="size-3.5 text-slate-400" />
                          <span>{item.expense_date}</span>
                        </div>
                      </td>

                      {/* Expense Title & Vendor */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 max-w-[280px] truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          {item.vendor_name && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="size-3 text-slate-400" />
                              {item.vendor_name}
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-slate-400 truncate max-w-[150px]" title={item.notes}>
                              • {item.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.category ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold border shadow-2xs"
                            style={{
                              borderColor: `${item.category.color}40`,
                              backgroundColor: `${item.category.color}15`,
                              color: item.category.color,
                            }}
                          >
                            <span
                              className="size-1.5 rounded-full"
                              style={{ backgroundColor: item.category.color }}
                            />
                            {item.category.name}
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                            Uncategorized
                          </span>
                        )}
                      </td>

                      {/* Payment Method & Ref */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="font-medium text-slate-700 capitalize">
                          {item.payment_method?.replace("_", " ")}
                        </div>
                        {item.reference_number && (
                          <div className="font-mono text-[10px] text-slate-400">
                            Ref: {item.reference_number}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {item.payment_status === "paid" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="size-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                            <Clock className="size-3" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-900 text-sm">
                        {formatPrice(item.amount)}
                      </td>

                      {/* Receipt Attachment */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-center">
                        {item.receipt_url ? (
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(item.receipt_url)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
                            title="View Receipt"
                          >
                            <FileText className="size-3.5 text-indigo-600" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditExpense(item)}
                            className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "expense",
                                id: item.id,
                                title: item.title,
                              })
                            }
                            className="grid size-7 place-items-center rounded-lg border border-red-100 bg-white text-red-500 shadow-2xs hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4">
            <AdminPagination paginator={expenses} />
          </div>
        </div>

        {/* ADD / EDIT EXPENSE MODAL */}
        {isAddExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white">
                    <Receipt className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editingExpense ? "Edit Expense Record" : "Record New Expense"}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Log business operational cost or vendor invoice.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleExpenseSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="font-semibold text-slate-700">
                    Expense Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    placeholder="e.g. Meta Ads Campaign, Shipping Boxes Procurement"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                {/* Amount & Category */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-semibold text-slate-700">
                      Amount ({currencySymbol} {currencyCode}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={expenseForm.expense_category_id}
                      onChange={(e) => setExpenseForm({ ...expenseForm, expense_category_id: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Payment Method */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-semibold text-slate-700">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={expenseForm.expense_date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={expenseForm.payment_method}
                      onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status & Vendor */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-semibold text-slate-700">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_status"
                          value="paid"
                          checked={expenseForm.payment_status === "paid"}
                          onChange={() => setExpenseForm({ ...expenseForm, payment_status: "paid" })}
                          className="size-3.5 text-slate-900"
                        />
                        <span className="font-medium text-emerald-700">Paid</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_status"
                          value="pending"
                          checked={expenseForm.payment_status === "pending"}
                          onChange={() => setExpenseForm({ ...expenseForm, payment_status: "pending" })}
                          className="size-3.5 text-slate-900"
                        />
                        <span className="font-medium text-amber-700">Pending / Due</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Vendor / Supplier</label>
                    <input
                      type="text"
                      value={expenseForm.vendor_name}
                      onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                      placeholder="e.g. Meta, DHL Express, AWS"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="font-semibold text-slate-700">Invoice / Reference #</label>
                  <input
                    type="text"
                    value={expenseForm.reference_number}
                    onChange={(e) => setExpenseForm({ ...expenseForm, reference_number: e.target.value })}
                    placeholder="e.g. INV-2026-0812 or Bank Ref ID"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="font-semibold text-slate-700">Receipt / Invoice Attachment</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      <Upload className="size-3.5" />
                      {isUploading ? "Uploading..." : "Upload Receipt / Bill"}
                    </button>
                    {expenseForm.receipt_url && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        <span>Attached</span>
                        <a
                          href={expenseForm.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold underline hover:text-emerald-800"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => setExpenseForm({ ...expenseForm, receipt_url: "" })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Supports JPG, PNG, WEBP and PDF documents.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-semibold text-slate-700">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    placeholder="Additional context, approvals or order links..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    {editingExpense ? "Update Expense" : "Save Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MANAGEMENT MODAL */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white">
                    <Tag className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Expense Categories
                    </h2>
                    <p className="text-xs text-slate-400">
                      Manage budget limits, color tags, and category taxonomies.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    setCategoryForm(defaultCategoryForm);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Add / Edit Form */}
                <form
                  onSubmit={handleCategorySubmit}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </h4>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryForm(defaultCategoryForm);
                        }}
                        className="text-[11px] text-slate-500 hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-semibold text-slate-700">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g. Legal Fees, Affiliate Marketing"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">
                        Monthly Budget ({currencySymbol} {currencyCode})
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={categoryForm.monthly_budget}
                          onChange={(e) => setCategoryForm({ ...categoryForm, monthly_budget: e.target.value })}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="font-semibold text-slate-700">Badge Color</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, color: c })}
                          className={cn(
                            "size-6 rounded-full border-2 transition-transform",
                            categoryForm.color === c ? "scale-110 border-slate-900 ring-2 ring-slate-900/20" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="size-6 cursor-pointer rounded-full border-0 p-0"
                        title="Pick custom color"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Description</label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief note on what belongs to this category"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      {editingCategory ? "Update Category" : "Add Category"}
                    </button>
                  </div>
                </form>

                {/* Categories Table */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50 font-semibold text-slate-500">
                      <tr>
                        <th className="px-3.5 py-2.5">Category</th>
                        <th className="px-3.5 py-2.5">Monthly Budget</th>
                        <th className="px-3.5 py-2.5">Expenses Count</th>
                        <th className="px-3.5 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50">
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <div>
                                <p className="font-bold text-slate-900">{cat.name}</p>
                                {cat.description && (
                                  <p className="text-[11px] text-slate-400">{cat.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-700">
                            {cat.monthly_budget ? formatPrice(cat.monthly_budget) : "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600 font-semibold">
                            {cat.expenses_count ?? 0} entries
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({
                                    name: cat.name,
                                    color: cat.color || "#6366F1",
                                    monthly_budget: cat.monthly_budget || "",
                                    description: cat.description || "",
                                  });
                                }}
                                className="grid size-6 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              >
                                <Edit2 className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "category",
                                    id: cat.id,
                                    title: cat.name,
                                  })
                                }
                                className="grid size-6 place-items-center rounded-md border border-red-100 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECEIPT PREVIEW MODAL */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Receipt Attachment</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={viewingReceipt}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <ExternalLink className="size-3.5" />
                    Open in New Window
                  </a>
                  <button
                    type="button"
                    onClick={() => setViewingReceipt(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-slate-50 p-2">
                {viewingReceipt.endsWith(".pdf") ? (
                  <iframe
                    src={viewingReceipt}
                    title="Receipt PDF"
                    className="h-[60vh] w-full rounded-lg border border-slate-200"
                  />
                ) : (
                  <img
                    src={viewingReceipt}
                    alt="Receipt Attachment"
                    className="max-h-[65vh] w-auto rounded-lg object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Delete {deleteConfirm.type === "expense" ? "Expense" : "Category"}?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete{" "}
                    <strong className="text-slate-900">"{deleteConfirm.title}"</strong>? This action
                    cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAction}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
