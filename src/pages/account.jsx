import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Truck,
  Download,
  ExternalLink,
  Plus,
  Check,
  Shield,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "@/components/site/cart";
import { cn } from "@/lib/utils";

const INITIAL_ORDERS = [
  {
    id: "ATL-894201",
    date: "Feb 18, 2026",
    status: "Delivered",
    total: 338,
    items: [
      { name: "Atelier Studio Headphones", qty: 1, price: 149, color: "Matte Obsidian" },
      { name: "Heavy Rib Cashmere Knit", qty: 1, price: 189, color: "Oatmeal Cream" },
    ],
    trackingNumber: "TRK-98421092",
    carrier: "DHL Express",
  },
  {
    id: "ATL-773194",
    date: "Jan 12, 2026",
    status: "Delivered",
    total: 320,
    items: [{ name: "Meridian Steel Watch", qty: 1, price: 320, color: "Silver & Obsidian" }],
    trackingNumber: "TRK-66194201",
    carrier: "FedEx Priority",
  },
];

export function AccountPage() {
  const navigate = useNavigate();
  const { count, wishlist } = useCart();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'addresses' | 'payments' | 'settings'
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "Alex Rivers",
    email: "alex.rivers@example.com",
    phone: "+1 (555) 234-5678",
    tier: "Atelier VIP Member",
  });

  // Addresses State
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: "Primary Residence",
      name: "Alex Rivers",
      street: "742 Evergreen Terrace, Apt 4B",
      city: "New York",
      state: "NY",
      zip: "10001",
      isDefault: true,
    },
    {
      id: 2,
      title: "Design Studio Office",
      name: "Alex Rivers / Atelier Labs",
      street: "180 Varick Street, Floor 8",
      city: "New York",
      state: "NY",
      zip: "10014",
      isDefault: false,
    },
  ]);

  // Load orders from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atelier_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setOrders([...parsed, ...INITIAL_ORDERS]);
        }
      }
    } catch (e) {
      console.error("Failed to load stored orders", e);
    }
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    toast.info("Signed out of Atelier");
    navigate("/");
  };

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">My Account</span>
        </nav>

        {/* Profile Card Header */}
        <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-2xl bg-ink text-ink-foreground text-xl font-extrabold shadow-sm">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                    {profile.name}
                  </h1>
                  <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent">
                    <Sparkles className="size-3" /> VIP
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-8 text-center">
              <div>
                <span className="text-lg font-extrabold text-foreground">{orders.length}</span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Orders</p>
              </div>
              <div>
                <span className="text-lg font-extrabold text-foreground">{wishlist.length}</span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Wishlist</p>
              </div>
              <div>
                <span className="text-lg font-extrabold text-foreground">{addresses.length}</span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Addresses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Portal */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT NAV TABS (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-surface p-3 shadow-xs space-y-1">
            {[
              { id: "orders", label: "Order History", icon: Package, count: orders.length },
              { id: "addresses", label: "Saved Addresses", icon: MapPin, count: addresses.length },
              { id: "payments", label: "Payment Methods", icon: CreditCard },
              { id: "settings", label: "Account Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-xs font-bold transition-all text-left",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="size-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      activeTab === tab.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-2 border-t border-border mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT PANEL (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
            {/* 1. ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Order History</h2>
                    <p className="text-xs text-muted-foreground">
                      Track deliveries, review invoices, and view receipts.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-4 hover:border-foreground/20 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
                        <div>
                          <span className="font-bold text-foreground">Order #{order.id}</span>
                          <span className="text-muted-foreground ml-2">• Placed on {order.date}</span>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                            order.status === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-amber-500/10 text-amber-700",
                          )}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-foreground font-medium">
                            <span>
                              {it.name} (x{it.qty || 1})
                            </span>
                            <span className="font-bold">{formatPrice(it.price * (it.qty || 1))}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-extrabold text-foreground">{formatPrice(order.total)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/track-order?id=${order.id}`}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                          >
                            <Truck className="size-3.5 text-accent" />
                            <span>Track Package</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => toast.success(`Invoice for #${order.id} downloaded.`)}
                            className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Download className="size-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Saved Addresses</h2>
                    <p className="text-xs text-muted-foreground">
                      Manage your delivery locations for fast 1-click checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Address modal triggered")}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={cn(
                        "rounded-2xl border p-5 space-y-3 relative flex flex-col justify-between",
                        addr.isDefault
                          ? "border-accent/40 bg-accent/5"
                          : "border-border/80 bg-background/50",
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                            {addr.title}
                          </h4>
                          {addr.isDefault && (
                            <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-foreground mt-2">{addr.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {addr.street}
                          <br />
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-border/60 text-xs">
                        <button
                          type="button"
                          onClick={() => toast.success("Address set as default")}
                          className="font-bold text-accent hover:underline"
                        >
                          Edit
                        </button>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => {
                              setAddresses(
                                addresses.map((a) => ({ ...a, isDefault: a.id === addr.id })),
                              );
                              toast.success("Default address updated");
                            }}
                            className="font-semibold text-muted-foreground hover:text-foreground"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PAYMENT METHODS */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Saved Payment Methods</h2>
                    <p className="text-xs text-muted-foreground">
                      Stored securely with AES-256 bank-level encryption.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("Add card flow opened")}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-ink text-ink-foreground font-bold text-xs">
                        VISA
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Visa ending in 4242</p>
                        <p className="text-[11px] text-muted-foreground">Expires 12/28 • Default</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold">
                      Default
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-muted text-foreground font-bold text-xs">
                        MC
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Mastercard ending in 8812</p>
                        <p className="text-[11px] text-muted-foreground">Expires 08/27</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success("Set as default")}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Make Default
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ACCOUNT SETTINGS */}
            {activeTab === "settings" && (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="border-b border-border pb-4">
                  <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                  <p className="text-xs text-muted-foreground">Update your profile details and preferences.</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex h-11 items-center justify-center rounded-full bg-primary px-8 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
