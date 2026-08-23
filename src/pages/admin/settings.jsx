import { useState, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General & Branding", icon: Globe },
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

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  // General & Branding
  const [general, setGeneral] = useState({
    storeName: "Atelier Studios Inc.",
    supportEmail: "care@atelier-studios.com",
    phone: "+1 (800) 555-ATELIER",
    currency: "USD — US Dollar",
    timezone: "UTC-5 (Eastern Standard)",
  });
  const [logoLight, setLogoLight] = useState(null);
  const [logoDark, setLogoDark] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const logolightRef = useRef(null);
  const logoDarkRef = useRef(null);
  const faviconRef = useRef(null);

  // SEO & Social
  const [seo, setSeo] = useState({
    metaTitle: "ATELIER — Precision-Crafted Modern Essentials",
    metaDescription: "Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods. Designed in Copenhagen and shipped worldwide.",
    metaKeywords: "luxury essentials, cashmere knitwear, studio headphones, leather accessories, Copenhagen design",
    ogTitle: "ATELIER — Modern Essentials",
    ogDescription: "Curated essentials for conscious modern living.",
    googleAnalyticsId: "G-XXXXXXXXXX",
    facebookPixelId: "123456789012345",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://atelier-studios.com/sitemap.xml",
  });

  // SMTP
  const [smtp, setSmtp] = useState({
    driver: "SMTP",
    host: "smtp.sendgrid.net",
    port: "587",
    encryption: "TLS (Port 587)",
    username: "apikey",
    password: "",
    fromName: "Atelier Studios",
    fromEmail: "noreply@atelier-studios.com",
  });
  const [smtpPasswordVisible, setSmtpPasswordVisible] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null); // null | 'success' | 'fail'

  const handleSmtpTest = () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    setTimeout(() => {
      setSmtpTesting(false);
      setSmtpTestResult("success");
      toast.success("Test email sent successfully!", {
        description: `Delivered to ${smtp.fromEmail} via ${smtp.host}:${smtp.port}`,
      });
    }, 1800);
  };

  // Payments
  const [payments, setPayments] = useState({
    stripePublishable: "pk_live_••••••••••••••••••••••••",
    stripeSecret: "",
    paypalClientId: "AY9xk••••••••••••••••",
    paypalSecret: "",
    codEnabled: true,
    testMode: false,
  });
  const [stripeSecretVisible, setStripeSecretVisible] = useState(false);

  // Shipping Zones
  const [shippingZones, setShippingZones] = useState([
    { id: 1, name: "Domestic Free Shipping", condition: "Orders > $100", rate: "Free", active: true },
    { id: 2, name: "Priority Express (US)", condition: "All US orders", rate: "$15.00", active: true },
    { id: 3, name: "International Standard", condition: "All International", rate: "$25.00", active: true },
    { id: 4, name: "Overnight Concierge", condition: "Same Day / Next Day", rate: "$45.00", active: false },
  ]);
  const [taxSettings, setTaxSettings] = useState({ automated: true, flatRate: "8.0", taxIncluded: false });

  // Staff
  const [staff, setStaff] = useState([
    { id: 1, name: "Alex Rivers", email: "alex@atelier-studios.com", role: "Super Admin", lastActive: "Just now", avatar: "AR" },
    { id: 2, name: "Sarah Chen", email: "sarah@atelier-studios.com", role: "Store Manager", lastActive: "2 hours ago", avatar: "SC" },
    { id: 3, name: "Mike Torres", email: "mike@atelier-studios.com", role: "Fulfillment Agent", lastActive: "Yesterday", avatar: "MT" },
  ]);

  const handleGeneralSave = () => toast.success("General settings saved successfully!");
  const handleSeoSave = () => toast.success("SEO & social settings updated!");
  const handleSmtpSave = () => toast.success("SMTP configuration saved!");
  const handlePaymentsSave = () => toast.success("Payment gateway settings updated!");
  const handleShippingSave = () => toast.success("Shipping & tax settings saved!");

  const handleImageUpload = (type) => {
    toast.info(`${type === "logoLight" ? "Light Mode Logo" : type === "logoDark" ? "Dark Mode Logo" : "Favicon"} upload would open a file picker dialog here.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Store Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure all aspects of your Atelier storefront and operations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Tabs Sidebar */}
        <aside className="w-full lg:w-60 lg:shrink-0 lg:sticky lg:top-24">
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
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-5">
          {/* ============ GENERAL & BRANDING ============ */}
          {activeTab === "general" && (
            <div className="space-y-5">
              {/* Store Info */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Store Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Legal Store Name", key: "storeName" },
                    { label: "Customer Support Email", key: "supportEmail" },
                    { label: "Customer Phone", key: "phone" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
                      <input
                        type="text"
                        value={general[key]}
                        onChange={(e) => setGeneral((f) => ({ ...f, [key]: e.target.value }))}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Currency</label>
                    <select value={general.currency} onChange={(e) => setGeneral((f) => ({ ...f, currency: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none">
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Timezone</label>
                    <select value={general.timezone} onChange={(e) => setGeneral((f) => ({ ...f, timezone: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none">
                      {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Logos & Favicon */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Brand Assets — Logos & Favicon</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Light Logo */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Light Mode Logo</label>
                    <div
                      onClick={() => handleImageUpload("logoLight")}
                      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors aspect-video"
                    >
                      <Image className="size-8 text-slate-300" />
                      <p className="text-[11px] font-semibold text-slate-400 text-center">Click to upload light logo</p>
                      <p className="text-[10px] text-slate-300 text-center">PNG or SVG, max 2MB</p>
                    </div>
                    <p className="text-[11px] text-slate-400">Used on light backgrounds & storefront header</p>
                  </div>

                  {/* Dark Logo */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dark Mode Logo</label>
                    <div
                      onClick={() => handleImageUpload("logoDark")}
                      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 p-6 cursor-pointer hover:border-slate-500 transition-colors aspect-video"
                    >
                      <Image className="size-8 text-slate-600" />
                      <p className="text-[11px] font-semibold text-slate-500 text-center">Click to upload dark logo</p>
                      <p className="text-[10px] text-slate-600 text-center">PNG or SVG, max 2MB</p>
                    </div>
                    <p className="text-[11px] text-slate-400">Used on dark backgrounds & admin sidebar</p>
                  </div>

                  {/* Favicon */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Browser Favicon</label>
                    <div
                      onClick={() => handleImageUpload("favicon")}
                      className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 cursor-pointer hover:border-slate-400 hover:bg-slate-100 transition-colors aspect-video"
                    >
                      <div className="rounded-lg bg-slate-200 p-2">
                        <div className="text-slate-500 font-extrabold text-xs">ICO</div>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400 text-center">Click to upload favicon</p>
                      <p className="text-[10px] text-slate-300 text-center">ICO, PNG 32×32px, max 500KB</p>
                    </div>
                    <p className="text-[11px] text-slate-400">Shown in browser tabs and bookmarks</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleGeneralSave} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                <Save className="size-3.5" /> Save General Settings
              </button>
            </div>
          )}

          {/* ============ SEO & SOCIAL ============ */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Search Engine Optimization</h2>

                {/* Google Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Live Google Preview</p>
                  <p className="text-sm text-blue-600 font-semibold">{seo.metaTitle || "Store Title"}</p>
                  <p className="text-[11px] text-emerald-700">atelier-studios.com</p>
                  <p className="text-xs text-slate-500">{seo.metaDescription || "Meta description will appear here..."}</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Global Meta Title</label>
                  <input type="text" value={seo.metaTitle} onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))} maxLength={60} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:bg-white focus:outline-none" />
                  <p className="text-[11px] text-slate-400 mt-1">{seo.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta Description</label>
                  <textarea rows={3} value={seo.metaDescription} onChange={(e) => setSeo((s) => ({ ...s, metaDescription: e.target.value }))} maxLength={155} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-900 focus:bg-white focus:outline-none resize-none" />
                  <p className="text-[11px] text-slate-400 mt-1">{seo.metaDescription.length}/155 characters</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta Keywords (comma separated)</label>
                  <input type="text" value={seo.metaKeywords} onChange={(e) => setSeo((s) => ({ ...s, metaKeywords: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                </div>
              </div>

              {/* Tracking */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Analytics & Tracking Codes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Google Analytics 4 (Measurement ID)</label>
                    <input type="text" value={seo.googleAnalyticsId} onChange={(e) => setSeo((s) => ({ ...s, googleAnalyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs uppercase focus:border-slate-900 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Facebook Pixel ID</label>
                    <input type="text" value={seo.facebookPixelId} onChange={(e) => setSeo((s) => ({ ...s, facebookPixelId: e.target.value }))} placeholder="123456789012345" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Robots.txt */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">robots.txt Configuration</h2>
                <textarea rows={6} value={seo.robotsTxt} onChange={(e) => setSeo((s) => ({ ...s, robotsTxt: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-950 text-emerald-400 p-4 font-mono text-xs focus:border-slate-500 focus:outline-none resize-none" />
              </div>

              <button type="button" onClick={handleSeoSave} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                <Save className="size-3.5" /> Save SEO Settings
              </button>
            </div>
          )}

          {/* ============ SMTP ============ */}
          {activeTab === "smtp" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Mail Driver & SMTP Configuration</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mail Driver</label>
                    <select value={smtp.driver} onChange={(e) => setSmtp((s) => ({ ...s, driver: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none">
                      {MAIL_DRIVERS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Encryption Method</label>
                    <select value={smtp.encryption} onChange={(e) => setSmtp((s) => ({ ...s, encryption: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none">
                      {SMTP_ENCRYPTIONS.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Host</label>
                    <input type="text" value={smtp.host} onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))} placeholder="smtp.sendgrid.net" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Port</label>
                    <input type="text" value={smtp.port} onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))} placeholder="587" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Username</label>
                    <input type="text" value={smtp.username} onChange={(e) => setSmtp((s) => ({ ...s, username: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SMTP Password / API Key</label>
                    <div className="mt-1 relative">
                      <input type={smtpPasswordVisible ? "text" : "password"} value={smtp.password} onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))} placeholder="Enter password or API key..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none" />
                      <button type="button" onClick={() => setSmtpPasswordVisible((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                        {smtpPasswordVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Name (From Name)</label>
                    <input type="text" value={smtp.fromName} onChange={(e) => setSmtp((s) => ({ ...s, fromName: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sender Email (From Address)</label>
                    <input type="email" value={smtp.fromEmail} onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:bg-white focus:outline-none" />
                  </div>
                </div>

                {/* Test Email */}
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Send Diagnostic Test Email</h4>
                  <p className="text-[11px] text-slate-500">Send a test email using the above SMTP settings to verify your configuration is working correctly.</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSmtpTest}
                      disabled={smtpTesting}
                      className="flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-70"
                    >
                      {smtpTesting ? <><Loader2 className="size-3.5 animate-spin" /> Sending...</> : <><Send className="size-3.5" /> Send Test Email</>}
                    </button>
                    {smtpTestResult === "success" && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                        <Check className="size-4" /> Test email delivered successfully!
                      </span>
                    )}
                    {smtpTestResult === "fail" && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 animate-in fade-in">
                        <AlertCircle className="size-4" /> SMTP connection failed. Check your credentials.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleSmtpSave} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                <Save className="size-3.5" /> Save SMTP Settings
              </button>
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeTab === "payments" && (
            <div className="space-y-5">
              {/* Test Mode Banner */}
              {payments.testMode && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-bold text-amber-800">
                  <AlertCircle className="size-5 shrink-0" />
                  Sandbox / Test Mode is ACTIVE. Real payments will NOT be processed.
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Payment Gateways</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Sandbox Mode</span>
                    <div
                      className={cn("relative h-5 w-10 rounded-full transition-colors", payments.testMode ? "bg-amber-500" : "bg-slate-200")}
                      onClick={() => setPayments((p) => ({ ...p, testMode: !p.testMode }))}
                    >
                      <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", payments.testMode ? "translate-x-5" : "translate-x-0.5")} />
                    </div>
                  </label>
                </div>

                {/* Stripe */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-extrabold text-white tracking-wider">STRIPE</div>
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5">Connected</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publishable Key</label>
                      <input type="text" value={payments.stripePublishable} onChange={(e) => setPayments((p) => ({ ...p, stripePublishable: e.target.value }))} className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs focus:border-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secret Key</label>
                      <div className="mt-1 relative">
                        <input type={stripeSecretVisible ? "text" : "password"} value={payments.stripeSecret} onChange={(e) => setPayments((p) => ({ ...p, stripeSecret: e.target.value }))} placeholder="sk_live_••••••••••••" className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-9 font-mono text-xs focus:border-slate-900 focus:outline-none" />
                        <button type="button" onClick={() => setStripeSecretVisible((v) => !v)} className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400">
                          {stripeSecretVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PayPal */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white tracking-wider">PAYPAL</div>
                    <span className="rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5">Connected</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client ID</label>
                      <input type="text" value={payments.paypalClientId} onChange={(e) => setPayments((p) => ({ ...p, paypalClientId: e.target.value }))} className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs focus:border-slate-900 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Secret</label>
                      <input type="password" value={payments.paypalSecret} onChange={(e) => setPayments((p) => ({ ...p, paypalSecret: e.target.value }))} placeholder="••••••••••••" className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs focus:border-slate-900 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* COD */}
                <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-slate-200 p-4">
                  <div
                    className={cn("relative h-5 w-10 rounded-full transition-colors", payments.codEnabled ? "bg-slate-900" : "bg-slate-200")}
                    onClick={() => setPayments((p) => ({ ...p, codEnabled: !p.codEnabled }))}
                  >
                    <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", payments.codEnabled ? "translate-x-5" : "translate-x-0.5")} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-400">Allow customers to pay on delivery for eligible orders</p>
                  </div>
                </label>
              </div>

              <button type="button" onClick={handlePaymentsSave} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                <Save className="size-3.5" /> Save Payment Settings
              </button>
            </div>
          )}

          {/* ============ SHIPPING & TAXES ============ */}
          {activeTab === "shipping" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Shipping Zones & Rates</h2>
                <div className="space-y-3">
                  {shippingZones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("relative h-5 w-10 rounded-full transition-colors cursor-pointer", zone.active ? "bg-emerald-500" : "bg-slate-200")}
                          onClick={() => setShippingZones((prev) => prev.map((z) => z.id === zone.id ? { ...z, active: !z.active } : z))}
                        >
                          <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", zone.active ? "translate-x-5" : "translate-x-0.5")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{zone.name}</p>
                          <p className="text-[11px] text-slate-400">{zone.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900">{zone.rate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax Settings */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Tax Collection Rules</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={cn("relative h-5 w-10 rounded-full transition-colors", taxSettings.automated ? "bg-slate-900" : "bg-slate-200")}
                    onClick={() => setTaxSettings((t) => ({ ...t, automated: !t.automated }))}
                  >
                    <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", taxSettings.automated ? "translate-x-5" : "translate-x-0.5")} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Automated Sales Tax (Recommended)</p>
                    <p className="text-[11px] text-slate-400">Automatically calculate tax based on customer location using real-time tax rules</p>
                  </div>
                </label>
                {!taxSettings.automated && (
                  <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Flat Tax Rate (%)</label>
                    <input type="number" value={taxSettings.flatRate} onChange={(e) => setTaxSettings((t) => ({ ...t, flatRate: e.target.value }))} placeholder="8.0" className="h-10 w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:border-slate-900 focus:outline-none" />
                  </div>
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={cn("relative h-5 w-10 rounded-full transition-colors", taxSettings.taxIncluded ? "bg-slate-900" : "bg-slate-200")}
                    onClick={() => setTaxSettings((t) => ({ ...t, taxIncluded: !t.taxIncluded }))}
                  >
                    <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", taxSettings.taxIncluded ? "translate-x-5" : "translate-x-0.5")} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Tax Included in Product Prices</p>
                    <p className="text-[11px] text-slate-400">Product prices already include tax (e.g. EU & UK requirements)</p>
                  </div>
                </label>
              </div>

              <button type="button" onClick={handleShippingSave} className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs">
                <Save className="size-3.5" /> Save Shipping & Tax Settings
              </button>
            </div>
          )}

          {/* ============ STAFF ============ */}
          {activeTab === "staff" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Staff Accounts & Permissions</h2>
                  <button type="button" onClick={() => toast.info("Invite staff member flow triggered")} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-slate-800">
                    <Plus className="size-3.5" /> Invite Staff
                  </button>
                </div>

                <div className="space-y-3">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                          <span className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                            member.role === "Super Admin" ? "bg-violet-50 text-violet-700 border-violet-200" :
                            member.role === "Store Manager" ? "bg-sky-50 text-sky-700 border-sky-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {member.role}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Active: {member.lastActive}</p>
                        </div>
                        {member.role !== "Super Admin" && (
                          <button type="button" onClick={() => toast.info(`Editing ${member.name}'s permissions...`)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
