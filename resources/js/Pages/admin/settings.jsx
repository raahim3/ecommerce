import { useState, useRef, useMemo } from "react";
import {
  Settings,
  Upload,
  Save,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X,
  Shield,
  Mail,
  Globe,
  CreditCard,
  Truck,
  Users,
  Image,
  Loader2,
  Plus,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Copy,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { AdminLayout } from "@/layouts/admin-layout";

const TABS = [
  { id: "general", label: "General & Branding", icon: Globe },
  { id: "coupons", label: "Promo Codes & Discounts", icon: Tag },
  { id: "seo", label: "SEO & Social", icon: Globe },
  { id: "smtp", label: "Mail & SMTP", icon: Mail },
  { id: "payments", label: "Payments & Gateways", icon: CreditCard },
  { id: "shipping", label: "Shipping & Taxes", icon: Truck },
  { id: "staff", label: "Staff & Permissions", icon: Users },
];

const CURRENCIES = ["USD — US Dollar", "EUR — Euro", "GBP — British Pound", "JPY — Japanese Yen", "SEK — Swedish Krona"];
const TIMEZONES = ["UTC-5 (Eastern Standard)", "UTC+0 (London)", "UTC+1 (Central European)", "UTC+5:30 (India)"];
const MAIL_DRIVERS = ["SMTP", "SendGrid", "Amazon SES", "Mailgun"];
const SMTP_ENCRYPTIONS = ["TLS (Port 587)", "SSL (Port 465)", "None (Port 25)"];

const EMPTY_COUPON = {
  code: "",
  discount_type: "percentage",
  value: "",
  min_spend: "",
  max_discount: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export function AdminSettingsPage({ settings = {}, coupons: serverCoupons = [] }) {
  const [activeTab, setActiveTab] = useState("general");
  const [savingGroup, setSavingGroup] = useState(null);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  // 1. General & Branding
  const [general, setGeneral] = useState({
    storeName: "Atelier Studios Inc.",
    tagline: "Precision-Crafted Modern Essentials",
    supportEmail: "care@atelier-studios.com",
    phone: "+1 (800) 555-ATELIER",
    currency: "USD — US Dollar",
    timezone: "UTC-5 (Eastern Standard)",
    logoLight: "",
    logoDark: "",
    favicon: "",
    ...(settings.general || {}),
  });

  // 2. SEO & Social
  const [seo, setSeo] = useState({
    metaTitle: "ATELIER — Precision-Crafted Modern Essentials",
    metaDescription: "Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods.",
    metaKeywords: "luxury essentials, cashmere knitwear, studio headphones, leather accessories",
    ogTitle: "ATELIER — Modern Essentials",
    ogDescription: "Curated essentials for conscious modern living.",
    googleAnalyticsId: "",
    facebookPixelId: "",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://atelier-studios.com/sitemap.xml",
    ...(settings.seo || {}),
  });

  // 3. SMTP
  const [smtp, setSmtp] = useState({
    driver: "SMTP",
    host: "smtp.mailtrap.io",
    port: "587",
    encryption: "TLS (Port 587)",
    username: "",
    password: "",
    fromName: "Atelier Studios",
    fromEmail: "noreply@atelier-studios.com",
    ...(settings.smtp || {}),
  });
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);

  // 4. Payments
  const [payments, setPayments] = useState({
    stripeEnabled: true,
    stripePublishable: "",
    stripeSecret: "",
    paypalEnabled: true,
    paypalClientId: "",
    paypalSecret: "",
    codEnabled: true,
    testMode: true,
    ...(settings.payments || {}),
  });
  const [stripeSecretVisible, setStripeSecretVisible] = useState(false);
  const [paypalSecretVisible, setPaypalSecretVisible] = useState(false);

  // 5. Shipping & Taxes
  const [shipping, setShipping] = useState(settings.shipping || {
    zones: [
      { id: 1, name: "Domestic Free Shipping", condition: "Orders > $100", rate: "Free", active: true },
      { id: 2, name: "Priority Express (US)", condition: "All US orders", rate: "$15.00", active: true },
      { id: 3, name: "International Standard", condition: "All International", rate: "$25.00", active: true },
    ],
    tax: { automated: true, flatRate: "8.0", taxIncluded: false },
  });

  // 6. Coupons & Promo Codes
  const [coupons, setCoupons] = useState(serverCoupons || []);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON);
  const [deleteCouponId, setDeleteCouponId] = useState(null);

  // 7. Staff
  const [staff, setStaff] = useState([
    { id: 1, name: "Alex Rivers", email: "alex@atelier-studios.com", role: "Super Admin", lastActive: "Just now", avatar: "AR" },
    { id: 2, name: "Sarah Chen", email: "sarah@atelier-studios.com", role: "Store Manager", lastActive: "2 hours ago", avatar: "SC" },
    { id: 3, name: "Mike Torres", email: "mike@atelier-studios.com", role: "Fulfillment Agent", lastActive: "Yesterday", avatar: "MT" },
  ]);

  // Generic Save for any Settings Group
  const handleSaveSettings = async (group, data) => {
    setSavingGroup(group);
    try {
      const res = await fetch("/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify({ group, data }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`${group.charAt(0).toUpperCase() + group.slice(1)} settings saved successfully!`);
      } else {
        toast.error(result.message || "Failed to save settings. Please try again.");
      }
    } catch {
      toast.error("Network error — settings could not be saved. Check your connection.");
    } finally {
      setSavingGroup(null);
    }
  };

  // Coupon Operations
  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.value) {
      toast.error("Promo code and discount value are required.");
      return;
    }

    try {
      const isEdit = !!editingCoupon;
      const endpoint = isEdit ? `/admin/settings/coupons/${editingCoupon.id}` : "/admin/settings/coupons";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify({
          code: couponForm.code.toUpperCase().trim(),
          discount_type: couponForm.discount_type,
          value: parseFloat(couponForm.value),
          min_spend: couponForm.min_spend ? parseFloat(couponForm.min_spend) : null,
          max_discount: couponForm.max_discount ? parseFloat(couponForm.max_discount) : null,
          usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
          expires_at: couponForm.expires_at || null,
          is_active: couponForm.is_active,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isEdit) {
          setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? data.coupon : c)));
          toast.success(`Coupon "${data.coupon.code}" updated!`);
        } else {
          setCoupons((prev) => [data.coupon, ...prev]);
          toast.success(`Coupon "${data.coupon.code}" created!`);
        }
        setCouponModalOpen(false);
        setCouponForm(EMPTY_COUPON);
        setEditingCoupon(null);
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch {
      toast.error("An error occurred while saving the coupon.");
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const res = await fetch(`/admin/settings/coupons/${coupon.id}/toggle`, {
        method: "PATCH",
        headers: { "X-CSRF-TOKEN": csrfToken() },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: data.is_active } : c))
        );
        toast.success(`Coupon "${coupon.code}" is now ${data.is_active ? "Active" : "Disabled"}`);
      }
    } catch {
      toast.error("Failed to toggle coupon status.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await fetch(`/admin/settings/coupons/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken() },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success("Coupon deleted.");
      }
    } catch {
      toast.error("Failed to delete coupon.");
    } finally {
      setDeleteCouponId(null);
    }
  };

  const openEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value || coupon.discount_value || "",
      min_spend: coupon.min_spend || "",
      max_discount: coupon.max_discount || "",
      usage_limit: coupon.usage_limit || "",
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
      is_active: !!coupon.is_active,
    });
    setCouponModalOpen(true);
  };

  const filteredCoupons = useMemo(() => {
    if (!couponSearch.trim()) return coupons;
    return coupons.filter((c) => c.code.toLowerCase().includes(couponSearch.toLowerCase()));
  }, [coupons, couponSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Store Settings & Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">Configure global store rules, payment gateways, shipping zones, and promotional discounts.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Tabs Sidebar */}
        <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-24">
          <nav className="rounded-3xl border border-slate-200 bg-white p-2 shadow-xs space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all text-left",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.id === "coupons" && (
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold", activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")}>
                    {coupons.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-5 w-full">
          {/* ============ 1. GENERAL & BRANDING ============ */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Store Profile</h2>
                    <p className="text-xs text-slate-500">Legal identity, customer service channels, and base currency.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("general", general)}
                    disabled={savingGroup === "general"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "general" ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal Store Name</label>
                    <input
                      type="text"
                      value={general.storeName}
                      onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Store Tagline / Slogan</label>
                    <input
                      type="text"
                      value={general.tagline || ""}
                      onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                      placeholder="e.g. Precision-Crafted Modern Essentials"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Support Email</label>
                    <input
                      type="email"
                      value={general.supportEmail}
                      onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Phone</label>
                    <input
                      type="text"
                      value={general.phone}
                      onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Currency</label>
                    <select
                      value={general.currency}
                      onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Store Timezone</label>
                    <select
                      value={general.timezone}
                      onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    >
                      {TIMEZONES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand Assets & Logos */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Brand Assets & Logos</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Configure store logos for light/dark modes and the browser favicon.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Light Logo */}
                    <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Logo (Light)</label>
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-violet-600 hover:text-violet-800">
                          <Upload className="size-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append("image", file);
                              fd.append("folder", "branding");
                              try {
                                const res = await fetch("/admin/api/upload", { method: "POST", headers: { "X-CSRF-TOKEN": csrfToken() }, body: fd });
                                const d = await res.json();
                                if (res.ok && d.url) {
                                  setGeneral((g) => ({ ...g, logoLight: d.url }));
                                  toast.success("Light logo uploaded!");
                                }
                              } catch { toast.error("Upload failed"); }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={general.logoLight || ""}
                        onChange={(e) => setGeneral({ ...general, logoLight: e.target.value })}
                        placeholder="Paste URL or click Upload"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                      />
                      <div className="h-16 w-full rounded-xl border border-slate-300 bg-slate-900 flex items-center justify-center p-2 overflow-hidden">
                        {general.logoLight ? (
                          <img src={general.logoLight} alt="Light Logo Preview" className="max-h-full object-contain" />
                        ) : (
                          <span className="text-xs font-bold tracking-tight text-white">{general.storeName || "ATELIER"}</span>
                        )}
                      </div>
                    </div>

                    {/* Dark Logo */}
                    <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Logo (Dark)</label>
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-violet-600 hover:text-violet-800">
                          <Upload className="size-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append("image", file);
                              fd.append("folder", "branding");
                              try {
                                const res = await fetch("/admin/api/upload", { method: "POST", headers: { "X-CSRF-TOKEN": csrfToken() }, body: fd });
                                const d = await res.json();
                                if (res.ok && d.url) {
                                  setGeneral((g) => ({ ...g, logoDark: d.url }));
                                  toast.success("Dark logo uploaded!");
                                }
                              } catch { toast.error("Upload failed"); }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={general.logoDark || ""}
                        onChange={(e) => setGeneral({ ...general, logoDark: e.target.value })}
                        placeholder="Paste URL or click Upload"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                      />
                      <div className="h-16 w-full rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                        {general.logoDark ? (
                          <img src={general.logoDark} alt="Dark Logo Preview" className="max-h-full object-contain" />
                        ) : (
                          <span className="text-xs font-bold tracking-tight text-slate-900">{general.storeName || "ATELIER"}</span>
                        )}
                      </div>
                    </div>

                    {/* Favicon */}
                    <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Browser Favicon</label>
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-violet-600 hover:text-violet-800">
                          <Upload className="size-3" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const fd = new FormData();
                              fd.append("image", file);
                              fd.append("folder", "branding");
                              try {
                                const res = await fetch("/admin/api/upload", { method: "POST", headers: { "X-CSRF-TOKEN": csrfToken() }, body: fd });
                                const d = await res.json();
                                if (res.ok && d.url) {
                                  setGeneral((g) => ({ ...g, favicon: d.url }));
                                  toast.success("Favicon uploaded!");
                                }
                              } catch { toast.error("Upload failed"); }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={general.favicon || ""}
                        onChange={(e) => setGeneral({ ...general, favicon: e.target.value })}
                        placeholder="Paste URL or click Upload"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                      />
                      <div className="h-16 w-full rounded-xl border border-slate-200 bg-white flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                        {general.favicon ? (
                          <img src={general.favicon} alt="Favicon Preview" className="size-8 object-contain" />
                        ) : (
                          <div className="grid size-8 place-items-center rounded-lg bg-slate-900 text-white font-bold text-xs">A</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ 2. PROMO CODES & COUPONS ============ */}
          {activeTab === "coupons" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Promotional Codes & Discounts</h2>
                    <p className="text-xs text-slate-500">Manage campaign coupon codes, percentage discounts, minimum spends, and usage thresholds.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingCoupon(null); setCouponForm(EMPTY_COUPON); setCouponModalOpen(true); }}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Plus className="size-4" />
                    <span>Create Discount Code</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    placeholder="Search promo codes (e.g. WELCOME10, SUMMER20)..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Coupons Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="p-4">Code</th>
                        <th className="p-4">Discount Value</th>
                        <th className="p-4">Condition</th>
                        <th className="p-4">Usage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredCoupons.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No coupon codes configured yet. Click &quot;Create Discount Code&quot; to launch your first promotion.
                          </td>
                        </tr>
                      ) : (
                        filteredCoupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-900 border border-slate-200">
                                  {coupon.code}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success(`Copied ${coupon.code}`); }}
                                  title="Copy Code"
                                  className="grid size-6 place-items-center rounded-md hover:bg-slate-200 text-slate-400"
                                >
                                  <Copy className="size-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-extrabold text-slate-900">
                                {coupon.discount_type === "percentage" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">
                              {coupon.min_spend ? `Min Spend: $${coupon.min_spend}` : "No Minimum"}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-900">{coupon.used_count || 0}</span>
                              <span className="text-slate-400"> / {coupon.usage_limit || "∞"} used</span>
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => handleToggleCoupon(coupon)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer",
                                  coupon.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                                )}
                              >
                                <span className={cn("size-1.5 rounded-full", coupon.is_active ? "bg-emerald-500" : "bg-slate-400")} />
                                {coupon.is_active ? "Active" : "Disabled"}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditCoupon(coupon)}
                                  className="grid size-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                                >
                                  <Edit2 className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteCouponId(coupon.id)}
                                  className="grid size-7 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ 3. SEO & SOCIAL ============ */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">SEO & Metadata Configuration</h2>
                    <p className="text-xs text-slate-500">Configure global metadata, search engine indexing, and social preview cards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("seo", seo)}
                    disabled={savingGroup === "seo"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "seo" ? "Saving..." : "Save SEO"}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta Title Tag</label>
                    <input
                      type="text"
                      value={seo.metaTitle}
                      onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta Description</label>
                    <textarea
                      rows={3}
                      value={seo.metaDescription}
                      onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ 4. MAIL & SMTP ============ */}
          {activeTab === "smtp" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Transactional Email & SMTP</h2>
                    <p className="text-xs text-slate-500">Configure outbound email delivery for receipts, notifications, and passwords.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("smtp", smtp)}
                    disabled={savingGroup === "smtp"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "smtp" ? "Saving..." : "Save SMTP"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mail Driver</label>
                    <select
                      value={smtp.driver || "SMTP"}
                      onChange={(e) => setSmtp({ ...smtp, driver: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    >
                      {MAIL_DRIVERS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Encryption</label>
                    <select
                      value={smtp.encryption || "TLS (Port 587)"}
                      onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value })}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    >
                      {SMTP_ENCRYPTIONS.map((enc) => (
                        <option key={enc} value={enc}>{enc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Host</label>
                    <input
                      type="text"
                      value={smtp.host}
                      onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                      placeholder="smtp.mailtrap.io"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Port</label>
                    <input
                      type="text"
                      value={smtp.port}
                      onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
                      placeholder="587"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Username</label>
                    <input
                      type="text"
                      value={smtp.username || ""}
                      onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                      placeholder="smtp_user"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Password</label>
                    <div className="relative mt-1">
                      <input
                        type={smtpPasswordVisible ? "text" : "password"}
                        value={smtp.password || ""}
                        onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSmtpPasswordVisible(!smtpPasswordVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {smtpPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender From Name</label>
                    <input
                      type="text"
                      value={smtp.fromName}
                      onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                      placeholder="Atelier Studios"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender From Email</label>
                    <input
                      type="email"
                      value={smtp.fromEmail}
                      onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                      placeholder="noreply@atelier-studios.com"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ 5. PAYMENTS ============ */}
          {activeTab === "payments" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Payment Gateway Configuration</h2>
                    <p className="text-xs text-slate-500">Connect Stripe, PayPal, and Cash on Delivery gateways.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("payments", payments)}
                    disabled={savingGroup === "payments"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "payments" ? "Saving..." : "Save Gateways"}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Test Mode Banner */}
                  <div className={cn(
                    "flex items-center justify-between rounded-2xl border p-4",
                    payments.testMode ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
                  )}>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Test / Sandbox Mode</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {payments.testMode ? "⚠ Test mode is ON — no real charges will be made." : "Live mode — real charges are processed."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayments({ ...payments, testMode: !payments.testMode })}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {payments.testMode
                        ? <ToggleRight className="size-8 text-amber-500" />
                        : <ToggleLeft className="size-8 text-slate-400" />}
                      <span className={cn("text-xs font-bold", payments.testMode ? "text-amber-600" : "text-slate-400")}>
                        {payments.testMode ? "ON" : "OFF"}
                      </span>
                    </button>
                  </div>

                  {/* Stripe */}
                  <div className={cn(
                    "rounded-2xl border p-5 space-y-3 transition-colors",
                    payments.stripeEnabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/70 opacity-75"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <CreditCard className="size-4 text-slate-700" /> Stripe Credit / Debit Card Processing
                      </span>
                      <button
                        type="button"
                        onClick={() => setPayments({ ...payments, stripeEnabled: !payments.stripeEnabled })}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        {payments.stripeEnabled
                          ? <ToggleRight className="size-7 text-emerald-500" />
                          : <ToggleLeft className="size-7 text-slate-400" />}
                        <span className={cn("text-[11px] font-bold", payments.stripeEnabled ? "text-emerald-600" : "text-slate-400")}>
                          {payments.stripeEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Stripe Publishable Key</label>
                        <input
                          type="text"
                          value={payments.stripePublishable}
                          onChange={(e) => setPayments({ ...payments, stripePublishable: e.target.value })}
                          placeholder="pk_test_..."
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Stripe Secret Key</label>
                        <div className="relative mt-1">
                          <input
                            type={stripeSecretVisible ? "text" : "password"}
                            value={payments.stripeSecret}
                            onChange={(e) => setPayments({ ...payments, stripeSecret: e.target.value })}
                            placeholder="sk_test_..."
                            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setStripeSecretVisible(!stripeSecretVisible)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {stripeSecretVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PayPal */}
                  <div className={cn(
                    "rounded-2xl border p-5 space-y-3 transition-colors",
                    payments.paypalEnabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/70 opacity-75"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <DollarSign className="size-4 text-blue-600" /> PayPal Express Checkout
                      </span>
                      <button
                        type="button"
                        onClick={() => setPayments({ ...payments, paypalEnabled: !payments.paypalEnabled })}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        {payments.paypalEnabled
                          ? <ToggleRight className="size-7 text-emerald-500" />
                          : <ToggleLeft className="size-7 text-slate-400" />}
                        <span className={cn("text-[11px] font-bold", payments.paypalEnabled ? "text-emerald-600" : "text-slate-400")}>
                          {payments.paypalEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">PayPal Client ID</label>
                        <input
                          type="text"
                          value={payments.paypalClientId}
                          onChange={(e) => setPayments({ ...payments, paypalClientId: e.target.value })}
                          placeholder="AYour_Client_ID..."
                          className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase">PayPal Secret</label>
                        <div className="relative mt-1">
                          <input
                            type={paypalSecretVisible ? "text" : "password"}
                            value={payments.paypalSecret}
                            onChange={(e) => setPayments({ ...payments, paypalSecret: e.target.value })}
                            placeholder="EYour_Secret..."
                            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setPaypalSecretVisible(!paypalSecretVisible)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {paypalSecretVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div className={cn(
                    "rounded-2xl border p-5 flex items-center justify-between",
                    payments.codEnabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"
                  )}>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Allow customers to pay when the order is delivered.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPayments({ ...payments, codEnabled: !payments.codEnabled })}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {payments.codEnabled
                        ? <ToggleRight className="size-8 text-emerald-500" />
                        : <ToggleLeft className="size-8 text-slate-400" />}
                      <span className={cn("text-xs font-bold", payments.codEnabled ? "text-emerald-600" : "text-slate-400")}>
                        {payments.codEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ============ 6. SHIPPING & TAXES ============ */}
          {activeTab === "shipping" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Shipping Rates & Tax Calculation</h2>
                    <p className="text-xs text-slate-500">Configure logistics tiers, free delivery thresholds, and VAT/Sales tax rates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("shipping", shipping)}
                    disabled={savingGroup === "shipping"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "shipping" ? "Saving..." : "Save Shipping"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Configured Shipping Zones</h3>
                  {shipping.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{zone.name}</p>
                        <p className="text-[11px] text-slate-500">{zone.condition}</p>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">{zone.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ 7. STAFF ============ */}
          {activeTab === "staff" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Staff Accounts & Access</h2>
                <div className="divide-y divide-slate-100">
                  {staff.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white font-bold text-xs">{s.avatar}</div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{s.name}</p>
                          <p className="text-[11px] text-slate-500">{s.email} • {s.role}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ COUPON CREATE / EDIT MODAL ============ */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Coupon Code *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VIP30, FLASH25"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono font-bold text-xs uppercase focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    placeholder={couponForm.discount_type === "percentage" ? "e.g. 20" : "e.g. 15.00"}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min Spend ($)</label>
                  <input
                    type="number"
                    value={couponForm.min_spend}
                    onChange={(e) => setCouponForm({ ...couponForm, min_spend: e.target.value })}
                    placeholder="e.g. 100"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usage_limit}
                    onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                    placeholder="e.g. 50"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm.expires_at}
                  onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                  className="size-4 rounded border-slate-300 accent-slate-900"
                />
                <span className="text-xs font-semibold text-slate-700">Coupon Active & Redeemable</span>
              </label>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoupon}
                className="flex-1 h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
              >
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE COUPON CONFIRMATION ============ */}
      {deleteCouponId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-red-50 mx-auto text-red-500">
              <Trash2 className="size-6" />
            </div>
            <h3 className="font-bold text-slate-900">Delete this promo coupon?</h3>
            <p className="text-xs text-slate-500">Shoppers will no longer be able to apply this discount code at checkout.</p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCouponId(null)}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCoupon(deleteCouponId)}
                className="flex-1 h-9 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
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

AdminSettingsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminSettingsPage;
