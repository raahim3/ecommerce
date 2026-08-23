import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Users,
  BarChart3,
  Tag,
  Settings,
  ExternalLink,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Shield,
  LogOut,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: Package, badge: "12 New" },
  { label: "Products", href: "/admin/products", icon: Layers, badge: "12 Active" },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Discounts & Promos", href: "/admin/discounts", icon: Tag },
  { label: "Store Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Close menus on route change or outside click
  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setQuickActionOpen(false);
  }, [location.pathname]);

  const handleQuickAction = (action) => {
    setQuickActionOpen(false);
    toast.success(`Action Triggered: ${action}`);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white antialiased">
      {/* ================= ADMIN SIDEBAR ================= */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:static",
          collapsed ? "w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white font-extrabold text-sm shadow-xs">
              A
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-slate-900 text-base">ATELIER</span>
                  <span className="rounded-md bg-violet-100 px-1.5 py-0.2 text-[10px] font-extrabold text-violet-700 uppercase">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Store
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="grid size-8 place-items-center rounded-lg hover:bg-slate-100 lg:hidden text-slate-500"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {!collapsed ? "Store Management" : "•••"}
          </div>

          {ADMIN_NAV.map((item) => {
            const isActive =
              item.exact
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                to={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900",
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Storefront Link */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {!collapsed ? "Public Store" : "•••"}
            </div>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              title={collapsed ? "View Live Store" : undefined}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="size-4 text-slate-400" />
                {!collapsed && <span>View Live Store</span>}
              </div>
              {!collapsed && (
                <span className="rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  Online
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-8 place-items-center rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0">
                AR
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Alex Rivers</p>
                  <p className="text-[11px] text-slate-500 truncate">Super Admin</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => {
                  toast.info("Logged out from Admin");
                  navigate("/login");
                }}
                title="Log Out"
                className="grid size-7 place-items-center rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Admin Header Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
          {/* Left: Mobile Toggle & Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            {/* Quick Search */}
            <div className="relative flex-1 hidden sm:block">
              <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search orders, products, customers... (Ctrl + K)"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-xs placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              />
              <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Quick Action, Notifications, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Action Button Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickActionOpen((v) => !v)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Quick Action</span>
                <ChevronDown className="size-3 text-slate-400 ml-0.5" />
              </button>

              {quickActionOpen && (
                <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in zoom-in-95">
                  <button
                    type="button"
                    onClick={() => handleQuickAction("Add New Product")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left"
                  >
                    <Layers className="size-3.5 text-slate-400" />
                    <span>+ Add Product</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAction("Create Discount Code")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left"
                  >
                    <Tag className="size-3.5 text-slate-400" />
                    <span>+ New Promo Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAction("Export Sales CSV")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left border-t border-slate-100 mt-1 pt-1"
                  >
                    <BarChart3 className="size-3.5 text-slate-400" />
                    <span>Export Sales CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-violet-600 ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900">Recent Store Alerts</span>
                    <span className="text-[10px] font-bold text-violet-600">3 Unread</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <ShoppingBag className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">New Order #ATL-894210</p>
                        <p className="text-[11px] text-slate-500">Alex Rivers paid $338.00 • 2m ago</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Low Stock Alert</p>
                        <p className="text-[11px] text-slate-500">Heavy Rib Cashmere Knit (4 left)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live Store Pill on Desktop */}
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Live Store</span>
              <ExternalLink className="size-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
