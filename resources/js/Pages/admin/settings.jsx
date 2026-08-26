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
  FileText,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { AdminLayout } from "@/layouts/admin-layout";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

const TABS = [
  { id: "general", label: "General & Branding", icon: Globe },
  { id: "homepage", label: "Homepage", icon: Image },
  { id: "navigation", label: "Navigation & Footer", icon: Globe },
  { id: "contact", label: "Contact Page", icon: Mail },
  { id: "about", label: "About Page", icon: FileText },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "privacy", label: "Privacy Policy", icon: FileText },
  { id: "coupons", label: "Promo Codes & Discounts", icon: Tag },
  { id: "seo", label: "SEO & Social", icon: Globe },
  { id: "smtp", label: "Mail & SMTP", icon: Mail },
  { id: "payments", label: "Payments & Gateways", icon: CreditCard },
  { id: "pusher", label: "Realtime Notifications", icon: Bell },
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

export function AdminSettingsPage({ settings = {}, coupons: serverCoupons = [], products = [], categories = [] }) {
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

  const [homepage, setHomepage] = useState({
    heroEyebrow: "New Season / 2026 Collection",
    heroTitle: "Discover\nWhat's\nNext.",
    heroDescription: "Curated essentials designed for modern living — made in small runs, built to outlast the season.",
    heroPrimaryLabel: "Shop Collection",
    heroPrimaryUrl: "/shop",
    heroSecondaryLabel: "Explore New Arrivals",
    heroSecondaryUrl: "/shop?sort=newest",
    heroImage: "",
    heroImageAlt: "Model wearing an off-white oversized wool coat against a soft concrete wall",
    heroProductId: "",
    heroBadge: "Just dropped",
    categoriesEyebrow: "Shop by category",
    categoriesTitle: "Everything, carefully edited.",
    categoriesSubtitle: "Four departments, one standard of quality.",
    categoriesActionLabel: "View all collections",
    categoriesActionUrl: "/shop",
    selectedCategoryIds: [],
    trendingEyebrow: "Trending now",
    trendingTitle: "Products everyone is talking about.",
    trendingSubtitle: "",
    trendingActionLabel: "View all products",
    trendingActionUrl: "/shop",
    trendingMode: "automatic",
    trendingProductIds: [],
    flashSaleEyebrow: "Up to 40% off",
    flashSaleTitle: "The Essentials\nSale",
    flashSaleDescription: "Two days only. Our most-loved pieces, marked down across every department.",
    flashSaleActionLabel: "Shop the sale",
    flashSaleActionUrl: "/shop?sale=true",
    flashSaleImage: "",
    flashSaleDurationHours: 48,
    bestSellerEyebrow: "Customer favorites",
    bestSellerTitle: "The pieces that keep selling out.",
    bestSellerSubtitle: "",
    bestSellerCategoryIds: [],
    editorialEyebrow: "Our philosophy",
    editorialTitle: "More than just shopping.",
    editorialDescription: "Thoughtfully selected products. Exceptional quality. Designed for the way you live — and made by people we know by name.",
    editorialImage: "",
    editorialImageAlt: "A calm minimal living room with a linen sofa and warm daylight",
    editorialStat1Value: "120+",
    editorialStat1Label: "Makers",
    editorialStat2Value: "18",
    editorialStat2Label: "Countries",
    editorialStat3Value: "94%",
    editorialStat3Label: "Repeat buyers",
    editorialActionLabel: "Our story",
    editorialActionUrl: "/about",
    reviewsEyebrow: "Loved by thousands",
    reviewsTitle: "Reviews that keep us honest.",
    reviewsMode: "original",
    manualReviews: [],
    newsletterEyebrow: "Stay in the loop",
    newsletterTitle: "First access to every drop.",
    newsletterDescription: "Get first access to new drops, exclusive offers and curated collections. No noise, one email a week.",
    newsletterPlaceholder: "Enter your email",
    newsletterButtonLabel: "Subscribe",
    socialEyebrow: "Follow the journey",
    socialTitle: "@atelier",
    socialGalleryImages: [],
    ...(settings.homepage || {}),
  });
  const [navigation, setNavigation] = useState({
    marqueeText: "Free shipping on orders over {currency}100 • Easy 30-day returns • Use code ATELIER10 for 10% off",
    headerMenuItems: [],
    footerDescription: "Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.",
    footerCopyright: "© {year} {store} All rights reserved.",
    footerShopLinks: [], footerServiceLinks: [], footerCompanyLinks: [],
    ...(settings.navigation || {}),
  });
  const [contact, setContact] = useState({
    eyebrow: "Client Services", title: "How can we assist you?", description: "Our client care specialists are on hand 7 days a week to answer questions regarding orders, sizing, materials, and styling.",
    emailTitle: "Email Client Care", emailDescription: "Average reply time: under 2 hours during studio hours.", email: "care@atelier-studios.com",
    phoneTitle: "Phone Concierge", phoneDescription: "Monday-Saturday, 9:00 AM - 6:00 PM EST.", phone: "+1 (800) 555-ATELIER", messageTitle: "Send a Message", faqTitle: "Frequently Asked Questions", faqDescription: "Find quick answers to common questions.", faqs: [],
    ...(settings.contact || {}),
  });
  const [legal, setLegal] = useState({
    about: { eyebrow: "The Atelier Manifesto", title: "Purity in form. Integrity in craft.", intro: "We exist to counter the culture of disposable trends.", image: "", body: "<h2>Our story</h2><p>We make considered essentials with integrity, quality, and care.</p>", ...(settings.about || {}) },
    terms: { eyebrow: "Legal", title: "Terms of Service", intro: "The terms that govern your use of Atelier.", body: "<h2>Using our store</h2><p>By using this website, you agree to these terms and our policies.</p>", ...(settings.terms || {}) },
    privacy: { eyebrow: "Legal", title: "Privacy Policy", intro: "How Atelier collects and protects your information.", body: "<h2>Your privacy matters</h2><p>We use your information only to provide and improve our services.</p>", ...(settings.privacy || {}) },
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

  const [pusher, setPusher] = useState({
    enabled: false,
    key: "",
    secret: "",
    app_id: "",
    cluster: "mt1",
    ...(settings.pusher || {}),
  });

  // 5. Shipping & Taxes
  const [shipping, setShipping] = useState(settings.shipping || {
    zones: [
      { id: 1, name: "Domestic Free Shipping", condition: `Orders > ${formatPrice(100)}`, rate: "Free", active: true },
      { id: 2, name: "Priority Express (US)", condition: "All US orders", rate: formatPrice(15), active: true },
      { id: 3, name: "International Standard", condition: "All International", rate: formatPrice(25), active: true },
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
        if (group === "pusher") {
          window.location.reload();
        }
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

          {activeTab === "navigation" && (
            <div className="space-y-5">
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div><h2 className="text-base font-bold text-slate-900">Navigation & Footer</h2><p className="mt-0.5 text-xs text-slate-500">Manage the marquee, header menu, footer links, and legal copy.</p></div>
                  <button type="button" onClick={() => handleSaveSettings("navigation", navigation)} disabled={savingGroup === "navigation"} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50"><Save className="size-3.5" />{savingGroup === "navigation" ? "Saving..." : "Save Changes"}</button>
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Top Bar Marquee Text</label>
                <input value={navigation.marqueeText || ""} onChange={(e) => setNavigation({ ...navigation, marqueeText: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs" />
                <div className="border-t border-slate-100 pt-5"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Header Menu</h3><p className="mt-1 text-[11px] text-slate-400">Choose Page, Category, or Custom URL for each item.</p>
                  {(navigation.headerMenuItems || []).map((item, index) => (
                    <div key={index} className="mt-3 grid grid-cols-[1fr_140px_1fr_auto] gap-2">
                      <input value={item.label || ""} onChange={(e) => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.map((x, i) => i === index ? { ...x, label: e.target.value } : x) })} placeholder="Label" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
                      <select value={item.type || "page"} onChange={(e) => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.map((x, i) => i === index ? { ...x, type: e.target.value, target: "" } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="page">Page</option><option value="category">Category</option><option value="custom">Custom URL</option></select>
                      {item.type === "category" ? <select value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select> : item.type === "page" ? <select value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="">Select page</option><option value="shop">Shop</option><option value="about">About</option><option value="contact">Contact</option><option value="wishlist">Wishlist</option><option value="account">Account</option></select> : <input value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} placeholder="https://... or /path" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />}
                      <button type="button" onClick={() => setNavigation({ ...navigation, headerMenuItems: navigation.headerMenuItems.filter((_, i) => i !== index) })} className="grid size-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNavigation({ ...navigation, headerMenuItems: [...(navigation.headerMenuItems || []), { label: "New link", type: "page", target: "shop" }] })} className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><Plus className="size-3.5" /> Add menu item</button>
                </div>
                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  {[['footerDescription', 'Footer Description'], ['footerCopyright', 'Copyright Text']].map(([field, label]) => <div key={field} className="sm:col-span-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label><textarea rows={2} value={navigation[field] || ""} onChange={(e) => setNavigation({ ...navigation, [field]: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs" /></div>)}
                </div>
                {[["footerShopLinks", "Shop Links"], ["footerServiceLinks", "Service Links"], ["footerCompanyLinks", "Company Links"]].map(([group, title]) => (
                  <div key={group} className="border-t border-slate-100 pt-5"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3>
                    {(navigation[group] || []).map((item, index) => (
                      <div key={index} className="mt-3 grid grid-cols-[1fr_120px_1fr_auto] gap-2">
                        <input value={item.label || ""} onChange={(e) => setNavigation({ ...navigation, [group]: navigation[group].map((x, i) => i === index ? { ...x, label: e.target.value } : x) })} placeholder="Label" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />
                        <select value={item.type || "page"} onChange={(e) => setNavigation({ ...navigation, [group]: navigation[group].map((x, i) => i === index ? { ...x, type: e.target.value, target: "" } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="page">Page</option><option value="category">Category</option><option value="custom">Custom URL</option></select>
                        {item.type === "category" ? <select value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, [group]: navigation[group].map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select> : item.type === "page" ? <select value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, [group]: navigation[group].map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 px-2 text-xs"><option value="">Select page</option><option value="shop">Shop</option><option value="about">About</option><option value="contact">Contact</option><option value="wishlist">Wishlist</option><option value="account">Account</option></select> : <input value={item.target || ""} onChange={(e) => setNavigation({ ...navigation, [group]: navigation[group].map((x, i) => i === index ? { ...x, target: e.target.value } : x) })} placeholder="https://... or /path" className="h-9 rounded-lg border border-slate-200 px-2 text-xs" />}
                        <button type="button" onClick={() => setNavigation({ ...navigation, [group]: navigation[group].filter((_, i) => i !== index) })} className="grid size-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setNavigation({ ...navigation, [group]: [...(navigation[group] || []), { label: "New link", type: "page", target: "shop" }] })} className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><Plus className="size-3.5" /> Add link</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-5">
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="text-base font-bold text-slate-900">Contact Page</h2><p className="mt-0.5 text-xs text-slate-500">Manage contact copy and frequently asked questions.</p></div><button type="button" onClick={() => handleSaveSettings("contact", contact)} disabled={savingGroup === "contact"} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white disabled:opacity-50"><Save className="size-3.5" />{savingGroup === "contact" ? "Saving..." : "Save Changes"}</button></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[["eyebrow", "Eyebrow"], ["title", "Page Title"], ["description", "Page Description"], ["emailTitle", "Email Card Title"], ["emailDescription", "Email Card Description"], ["email", "Support Email"], ["phoneTitle", "Phone Card Title"], ["phoneDescription", "Phone Card Description"], ["phone", "Phone Number"], ["messageTitle", "Message Form Title"], ["faqTitle", "FAQ Title"], ["faqDescription", "FAQ Description"]].map(([field, label]) => <div key={field} className={field === "description" || field === "faqDescription" ? "sm:col-span-2" : ""}><label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label><input value={contact[field] || ""} onChange={(e) => setContact({ ...contact, [field]: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs" /></div>)}</div>
                <div className="space-y-3 border-t border-slate-100 pt-5"><div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Frequently Asked Questions</h3><button type="button" onClick={() => setContact({ ...contact, faqs: [...(contact.faqs || []), { id: Date.now(), category: "General", q: "", a: "" }] })} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><Plus className="size-3.5" /> Add FAQ</button></div>{(contact.faqs || []).map((faq, index) => <div key={faq.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"><input value={faq.category || ""} placeholder="Category" onChange={(e) => setContact({ ...contact, faqs: contact.faqs.map((x, i) => i === index ? { ...x, category: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs" /><input value={faq.q || ""} placeholder="Question" onChange={(e) => setContact({ ...contact, faqs: contact.faqs.map((x, i) => i === index ? { ...x, q: e.target.value } : x) })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs" /><button type="button" onClick={() => setContact({ ...contact, faqs: contact.faqs.filter((x) => x.id !== faq.id) })} className="grid size-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button></div><textarea value={faq.a || ""} placeholder="Answer" onChange={(e) => setContact({ ...contact, faqs: contact.faqs.map((x, i) => i === index ? { ...x, a: e.target.value } : x) })} rows={3} className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs" /></div>)}{(contact.faqs || []).length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">No custom FAQs configured. Add one to replace the default FAQ list.</p>}</div>
              </div>
            </div>
          )}

          {(activeTab === "about" || activeTab === "terms" || activeTab === "privacy") && (() => {
            const data = legal[activeTab];
            const label = activeTab === "about" ? "About Page" : activeTab === "terms" ? "Terms of Service" : "Privacy Policy";
            return <div className="space-y-5"><div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="text-base font-bold text-slate-900">{label}</h2><p className="mt-0.5 text-xs text-slate-500">Edit this public page with rich text formatting.</p></div><button type="button" onClick={() => handleSaveSettings(activeTab, data)} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"><Save className="size-3.5" />Save Page</button></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input value={data.eyebrow || ""} onChange={(e) => setLegal({ ...legal, [activeTab]: { ...data, eyebrow: e.target.value } })} placeholder="Eyebrow" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs" /><input value={data.title || ""} onChange={(e) => setLegal({ ...legal, [activeTab]: { ...data, title: e.target.value } })} placeholder="Title" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs" /><input value={data.intro || ""} onChange={(e) => setLegal({ ...legal, [activeTab]: { ...data, intro: e.target.value } })} placeholder="Intro" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs sm:col-span-2" /></div>{activeTab === "about" && <input value={data.image || ""} onChange={(e) => setLegal({ ...legal, about: { ...data, image: e.target.value } })} placeholder="About image URL" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs" />}<RichTextEditor value={data.body || ""} onChange={(body) => setLegal({ ...legal, [activeTab]: { ...data, body } })} /></div></div>;
          })()}

          {activeTab === "homepage" && (
            <div className="space-y-5">
              <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Homepage Hero</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Manage the first section and choose the product shown on the right.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings("homepage", homepage)}
                    disabled={savingGroup === "homepage"}
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Save className="size-3.5" />
                    <span>{savingGroup === "homepage" ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["heroEyebrow", "Eyebrow"],
                    ["heroBadge", "Top Badge"],
                    ["heroPrimaryLabel", "Primary Button Label"],
                    ["heroPrimaryUrl", "Primary Button URL"],
                    ["heroSecondaryLabel", "Secondary Button Label"],
                    ["heroSecondaryUrl", "Secondary Button URL"],
                    ["heroImage", "Hero Image URL"],
                    ["heroImageAlt", "Hero Image Alt Text"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                      <input
                        type="text"
                        value={homepage[field] || ""}
                        onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Title</label>
                    <textarea
                      value={homepage.heroTitle || ""}
                      onChange={(e) => setHomepage({ ...homepage, heroTitle: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Use one line for each line of the headline.</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Description</label>
                    <textarea
                      value={homepage.heroDescription || ""}
                      onChange={(e) => setHomepage({ ...homepage, heroDescription: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Right-Side Product</label>
                  <select
                    value={homepage.heroProductId || ""}
                    onChange={(e) => setHomepage({ ...homepage, heroProductId: e.target.value || null })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="">Automatically show latest product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name} ({formatPrice(product.price)})</option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">Leave automatic to use the newest active product. Select a product to override it.</p>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Homepage Categories Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Set the section copy and choose which categories appear below the hero.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["categoriesEyebrow", "Section Eyebrow"],
                      ["categoriesTitle", "Section Title"],
                      ["categoriesSubtitle", "Section Subtitle"],
                      ["categoriesActionLabel", "Action Button Label"],
                      ["categoriesActionUrl", "Action Button URL"],
                    ].map(([field, label]) => (
                      <div key={field} className={field === "categoriesSubtitle" ? "sm:col-span-2" : ""}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input
                          type="text"
                          value={homepage[field] || ""}
                          onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Categories to Display</label>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {categories.map((category) => {
                        const selected = (homepage.selectedCategoryIds || []).map(Number).includes(Number(category.id));
                        return (
                          <label key={category.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setHomepage({
                                ...homepage,
                                selectedCategoryIds: selected
                                  ? homepage.selectedCategoryIds.filter((id) => Number(id) !== Number(category.id))
                                  : [...(homepage.selectedCategoryIds || []), category.id],
                              })}
                              className="size-4 accent-slate-900"
                            />
                            <span>{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Leave all unchecked to show every active category. More than four selected categories become a carousel.</p>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 pt-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Trending Products Section</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Choose automatic sales-based ranking or a manual product list.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        ["trendingEyebrow", "Section Eyebrow"],
                        ["trendingTitle", "Section Title"],
                        ["trendingSubtitle", "Section Subtitle"],
                        ["trendingActionLabel", "Action Button Label"],
                        ["trendingActionUrl", "Action Button URL"],
                      ].map(([field, label]) => (
                        <div key={field}>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                          <input
                            type="text"
                            value={homepage[field] || ""}
                            onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })}
                            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trending Source</label>
                      <select
                        value={homepage.trendingMode || "automatic"}
                        onChange={(e) => setHomepage({ ...homepage, trendingMode: e.target.value })}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      >
                        <option value="automatic">Automatic: most purchased products</option>
                        <option value="manual">Manual: choose products below</option>
                      </select>
                    </div>
                    {homepage.trendingMode === "manual" && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Manual Trending Products</label>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {products.map((product) => {
                            const selected = (homepage.trendingProductIds || []).map(Number).includes(Number(product.id));
                            return (
                              <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => setHomepage({
                                    ...homepage,
                                    trendingProductIds: selected
                                      ? homepage.trendingProductIds.filter((id) => Number(id) !== Number(product.id))
                                      : [...(homepage.trendingProductIds || []), product.id],
                                  })}
                                  className="size-4 accent-slate-900"
                                />
                                <span className="truncate">{product.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400">Select up to 8 products. They appear in the order selected.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Flash Sale Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Control the campaign content, background, and countdown duration.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["flashSaleEyebrow", "Sale Eyebrow"],
                      ["flashSaleActionLabel", "Button Label"],
                      ["flashSaleActionUrl", "Button URL"],
                      ["flashSaleImage", "Background Image URL"],
                      ["flashSaleDurationHours", "Countdown Hours"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input
                          type={field === "flashSaleDurationHours" ? "number" : "text"}
                          min={1}
                          value={homepage[field] ?? ""}
                          onChange={(e) => setHomepage({ ...homepage, [field]: field === "flashSaleDurationHours" ? Number(e.target.value) : e.target.value })}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sale Title</label>
                      <textarea
                        value={homepage.flashSaleTitle || ""}
                        onChange={(e) => setHomepage({ ...homepage, flashSaleTitle: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sale Description</label>
                      <textarea
                        value={homepage.flashSaleDescription || ""}
                        onChange={(e) => setHomepage({ ...homepage, flashSaleDescription: e.target.value })}
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Best Sellers Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Configure the section copy and the category tabs shown on the homepage.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["bestSellerEyebrow", "Section Eyebrow"],
                      ["bestSellerTitle", "Section Title"],
                      ["bestSellerSubtitle", "Section Subtitle"],
                    ].map(([field, label]) => (
                      <div key={field} className={field === "bestSellerSubtitle" ? "sm:col-span-2" : ""}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input
                          type="text"
                          value={homepage[field] || ""}
                          onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category Tabs</label>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {categories.map((category) => {
                        const selected = (homepage.bestSellerCategoryIds || []).map(Number).includes(Number(category.id));
                        return (
                          <label key={category.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setHomepage({
                                ...homepage,
                                bestSellerCategoryIds: selected
                                  ? homepage.bestSellerCategoryIds.filter((id) => Number(id) !== Number(category.id))
                                  : [...(homepage.bestSellerCategoryIds || []), category.id],
                              })}
                              className="size-4 accent-slate-900"
                            />
                            <span>{category.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">Selected categories become tabs. Leave all unchecked to show all active category tabs.</p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Editorial Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Manage the editorial story, image, statistics, and link.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["editorialEyebrow", "Eyebrow"],
                      ["editorialImage", "Image URL"],
                      ["editorialImageAlt", "Image Alt Text"],
                      ["editorialActionLabel", "Link Label"],
                      ["editorialActionUrl", "Link URL"],
                      ["editorialStat1Value", "Stat 1 Value"],
                      ["editorialStat1Label", "Stat 1 Label"],
                      ["editorialStat2Value", "Stat 2 Value"],
                      ["editorialStat2Label", "Stat 2 Label"],
                      ["editorialStat3Value", "Stat 3 Value"],
                      ["editorialStat3Label", "Stat 3 Label"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input
                          type="text"
                          value={homepage[field] || ""}
                          onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })}
                          className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
                      <textarea
                        value={homepage.editorialTitle || ""}
                        onChange={(e) => setHomepage({ ...homepage, editorialTitle: e.target.value })}
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                      <textarea
                        value={homepage.editorialDescription || ""}
                        onChange={(e) => setHomepage({ ...homepage, editorialDescription: e.target.value })}
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Reviews Section</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Show original customer reviews or manage homepage reviews manually.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHomepage({
                        ...homepage,
                        reviewsMode: "manual",
                        manualReviews: [...(homepage.manualReviews || []), { id: Date.now(), quote: "", name: "", role: "Verified Customer" }],
                      })}
                      className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Plus className="size-3.5" /> Add Review
                    </button>
                  </div>
                  <select
                    value={homepage.reviewsMode || "original"}
                    onChange={(e) => setHomepage({ ...homepage, reviewsMode: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="original">Original Reviews: approved customer reviews</option>
                    <option value="manual">Manual Reviews: use reviews created below</option>
                  </select>
                  {homepage.reviewsMode === "manual" && (
                    <div className="space-y-3">
                      {(homepage.manualReviews || []).map((review, index) => (
                        <div key={review.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Review {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => setHomepage({ ...homepage, manualReviews: homepage.manualReviews.filter((item) => item.id !== review.id) })}
                              className="grid size-7 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                              title="Delete review"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[['name', 'Reviewer Name'], ['role', 'Reviewer Role']].map(([field, label]) => (
                              <div key={field}>
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
                                <input
                                  value={review[field] || ""}
                                  onChange={(e) => setHomepage({ ...homepage, manualReviews: homepage.manualReviews.map((item) => item.id === review.id ? { ...item, [field]: e.target.value } : item) })}
                                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                                />
                              </div>
                            ))}
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Review Text</label>
                              <textarea
                                value={review.quote || ""}
                                onChange={(e) => setHomepage({ ...homepage, manualReviews: homepage.manualReviews.map((item) => item.id === review.id ? { ...item, quote: e.target.value } : item) })}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {homepage.manualReviews?.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">No manual reviews yet. Click Add Review.</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Newsletter Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Customize the subscription call-to-action shown on the homepage.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[["newsletterEyebrow", "Eyebrow"], ["newsletterPlaceholder", "Email Placeholder"], ["newsletterButtonLabel", "Button Label"], ["newsletterTitle", "Title"]].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input value={homepage[field] || ""} onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                      <textarea value={homepage.newsletterDescription || ""} onChange={(e) => setHomepage({ ...homepage, newsletterDescription: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Social Gallery Section</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Upload gallery images and set the section heading. Click any image on the storefront for a large preview.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[["socialEyebrow", "Eyebrow"], ["socialTitle", "Title"]].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                        <input value={homepage[field] || ""} onChange={(e) => setHomepage({ ...homepage, [field]: e.target.value })} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                      </div>
                    ))}
                  </div>
                  <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-white">
                    <Upload className="size-4" /> Upload Gallery Image
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData(); formData.append("image", file); formData.append("folder", "homepage");
                      try {
                        const response = await fetch("/admin/api/upload", { method: "POST", headers: { "X-CSRF-TOKEN": csrfToken() }, body: formData });
                        const data = await response.json();
                        if (!response.ok || !data.url) throw new Error("Upload failed");
                        setHomepage({ ...homepage, socialGalleryImages: [...(homepage.socialGalleryImages || []), { url: data.url, alt: file.name.replace(/\.[^/.]+$/, "") }] });
                        toast.success("Gallery image uploaded.");
                      } catch { toast.error("Gallery image upload failed."); }
                    }} />
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(homepage.socialGalleryImages || []).map((image, index) => (
                      <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img src={image.url} alt={image.alt || "Gallery preview"} className="aspect-square w-full object-cover" />
                        <input value={image.alt || ""} onChange={(e) => setHomepage({ ...homepage, socialGalleryImages: homepage.socialGalleryImages.map((item, itemIndex) => itemIndex === index ? { ...item, alt: e.target.value } : item) })} placeholder="Alt text" className="h-8 w-full border-t border-slate-200 bg-white px-2 text-[10px] outline-none" />
                        <button type="button" onClick={() => setHomepage({ ...homepage, socialGalleryImages: homepage.socialGalleryImages.filter((_, itemIndex) => itemIndex !== index) })} className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-red-600 text-white" title="Remove image"><X className="size-3.5" /></button>
                      </div>
                    ))}
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


          {/* ============ REALTIME NOTIFICATIONS ============ */}
          {activeTab === "pusher" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Realtime Admin Notifications</h2>
                    <p className="text-xs text-slate-500">Connect Pusher so new orders and stock alerts arrive without refreshing.</p>
                  </div>
                  <button type="button" onClick={() => setPusher({ ...pusher, enabled: !pusher.enabled })} className="flex items-center gap-2 text-xs font-bold">
                    {pusher.enabled ? <ToggleRight className="size-8 text-emerald-500" /> : <ToggleLeft className="size-8 text-slate-400" />}
                    {pusher.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["key", "App Key"], ["app_id", "App ID"], ["cluster", "Cluster"]].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                      <input value={pusher[field] || ""} onChange={(e) => setPusher({ ...pusher, [field]: e.target.value })} placeholder={field === "cluster" ? "mt1" : "Pusher value"} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">App Secret</label>
                    <input type="password" value={pusher.secret || ""} onChange={(e) => setPusher({ ...pusher, secret: e.target.value })} placeholder="Pusher secret" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <button type="button" onClick={() => handleSaveSettings("pusher", pusher)} disabled={savingGroup === "pusher"} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"><Save className="size-3.5" />{savingGroup === "pusher" ? "Saving..." : "Save Pusher Settings"}</button>
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

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax Configuration</h3>
                    <p className="mt-1 text-[11px] text-slate-500">This rate is applied to the discounted subtotal at checkout.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tax Rate (%)</label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={shipping.tax?.flatRate ?? ""}
                          onChange={(e) => setShipping({ ...shipping, tax: { ...(shipping.tax || {}), flatRate: e.target.value } })}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-8 text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 self-end pb-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(shipping.tax?.taxIncluded)}
                        onChange={(e) => setShipping({ ...shipping, tax: { ...(shipping.tax || {}), taxIncluded: e.target.checked } })}
                        className="size-4 rounded border-slate-300 accent-slate-900"
                      />
                      Prices already include tax
                    </label>
                  </div>
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
