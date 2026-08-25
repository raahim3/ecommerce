import { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
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
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Pusher from "pusher-js";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: Package, badge: "Live" },
  { label: "Products", href: "/admin/products", icon: Layers },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
  { label: "Store Settings", href: "/admin/settings", icon: Settings },
  { label: "Contact Messages", href: "/admin/contact-submissions", icon: Mail },
];

export function AdminLayout({ children }) {
  const { url, props } = usePage();
  const user = props?.auth?.user;
  const generalSettings = props?.app_settings?.general || {};
  const navigate = (href) => router.visit(href);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Dynamic Notifications state
  const [notifications, setNotifications] = useState(props?.admin_notifications?.recent || []);
  const [unreadCount, setUnreadCount] = useState(props?.admin_notifications?.unread_count || 0);

  // Sync with inertia props
  useEffect(() => {
    if (props?.admin_notifications) {
      setNotifications(props.admin_notifications.recent || []);
      setUnreadCount(props.admin_notifications.unread_count || 0);
    }
  }, [props?.admin_notifications]);

  useEffect(() => {
    const realtime = props?.app_settings?.realtime;
    if (!realtime?.enabled || !realtime.key || !realtime.cluster) return undefined;

    Pusher.logToConsole = true;
    const pusher = new Pusher(realtime.key, {
      cluster: realtime.cluster,
      forceTLS: true,
      authEndpoint: "/admin/api/broadcasting/auth",
      auth: {
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken(),
        },
      },
    });
    const channel = pusher.subscribe("private-admin-notifications");
    pusher.connection.bind("state_change", (states) => {
      console.info("Pusher state", states.previous, "->", states.current);
    });
    pusher.connection.bind("connected", () => {
      console.info("Pusher connected", pusher.connection.socket_id);
    });
    pusher.connection.bind("error", (error) => {
      console.error("Pusher connection error", error);
    });
    channel.bind("pusher:subscription_error", (error) => {
      console.error("Pusher subscription error", error);
      toast.error("Realtime notifications could not connect.");
    });
    channel.bind("admin.notification", (notification) => {
      setNotifications((previous) => [notification, ...previous.filter((item) => item.id !== notification.id)].slice(0, 10));
      setUnreadCount((count) => count + 1);
      toast.info(notification.title, { description: notification.message });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("private-admin-notifications");
      pusher.disconnect();
    };
  }, [props?.app_settings?.realtime?.enabled, props?.app_settings?.realtime?.key, props?.app_settings?.realtime?.cluster]);

  // Close menus on route change or outside click
  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setQuickActionOpen(false);
  }, [url]);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const handleMarkAllRead = async () => {
    try {
      await fetch("/admin/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await fetch(`/admin/api/notifications/${notif.id}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
        });
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {}
    }
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/admin/api/notifications", {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken() },
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notifications cleared");
    } catch {}
  };

  const handleQuickAction = (action) => {
    setQuickActionOpen(false);
    if (action === "Add New Product") navigate("/admin/products/create");
    else if (action === "Create Discount Code") navigate("/admin/settings");
    else if (action === "Export Sales CSV") navigate("/admin/reports");
  };

  const getNotifIcon = (type) => {
    if (type === "order") return <ShoppingBag className="size-4 text-emerald-600 shrink-0 mt-0.5" />;
    if (type === "low_stock") return <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />;
    if (type === "customer") return <Users className="size-4 text-blue-600 shrink-0 mt-0.5" />;
    return <Sparkles className="size-4 text-violet-600 shrink-0 mt-0.5" />;
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
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            {generalSettings.logoDark ? (
              <img src={generalSettings.logoDark} alt="Store Logo" className="h-14 w-auto object-contain shrink-0" />
            ) : (
              <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white font-extrabold text-sm shadow-xs shrink-0">
                {generalSettings.storeName ? generalSettings.storeName.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            {!collapsed && !generalSettings.logoDark && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-slate-900 text-base truncate">
                    {generalSettings.storeName || "ATELIER"}
                  </span>
                  <span className="rounded-md bg-violet-100 px-1.5 py-0.2 text-[10px] font-extrabold text-violet-700 uppercase shrink-0">
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
                ? url === item.href
                : url.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
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
              href="/"
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
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || "Super Admin"}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => {
                  router.post("/logout", {}, {
                    onSuccess: () => toast.success("Logged out from Admin"),
                  });
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 w-84 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Store Alerts & Activity</span>
                      {unreadCount > 0 ? (
                        <span className="rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 text-[10px] font-bold border border-violet-200">
                          {unreadCount} Unread
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">All caught up</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-violet-600 hover:text-violet-800 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 no-scrollbar text-xs">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-1">
                        <CheckCircle2 className="size-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-xs text-slate-600">No new notifications</p>
                        <p className="text-[11px] text-slate-400">Orders and store alerts will appear here in real-time.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={cn(
                            "flex gap-3 rounded-xl p-3 border transition-all cursor-pointer",
                            notif.is_read
                              ? "bg-white border-slate-100 hover:bg-slate-50 text-slate-600"
                              : "bg-violet-50/40 border-violet-100 hover:bg-violet-50/70 text-slate-900 shadow-2xs"
                          )}
                        >
                          {getNotifIcon(notif.type)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-xs truncate">{notif.title}</p>
                              {!notif.is_read && (
                                <span className="size-1.5 rounded-full bg-violet-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 font-medium block mt-1">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {new Date(notif.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Store Pill on Desktop */}
            <Link
              href="/"
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
