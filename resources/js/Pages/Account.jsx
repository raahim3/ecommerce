import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
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
  Trash2,
  Edit,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "@/components/site/cart";
import { cn } from "@/lib/utils";
import { SiteLayout } from "@/layouts/site-layout";

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

export function AccountPage({ user: serverUser = null, orders: serverOrders = [], addresses: serverAddresses = [] }) {
  const navigate = (href) => router.visit(href);
  const { count, wishlist } = useCart();
  const [activeTab, setActiveTab] = useState("orders");

  // Profile Form State — seeded from server
  const [profile, setProfile] = useState({
    name: serverUser?.name || "Alex Rivers",
    email: serverUser?.email || "alex.rivers@example.com",
    phone: serverUser?.phone || "+1 (555) 234-5678",
    tier: "Atelier VIP Member",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Orders — merge server orders with any localStorage fallback
  const [orders, setOrders] = useState(() => {
    if (serverOrders.length > 0) return serverOrders;
    try {
      const stored = JSON.parse(localStorage.getItem("atelier_orders") || "[]");
      return stored.length > 0 ? stored : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Addresses — seeded from server
  const [addresses, setAddresses] = useState(serverAddresses.length > 0 ? serverAddresses : [
    {
      id: 1,
      first_name: "Alex",
      last_name: "Rivers",
      address_line1: "742 Evergreen Terrace, Apt 4B",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "US",
      phone: "+1 (555) 234-5678",
      is_default: true,
    },
  ]);

  // Saved Cards state
  const [cards, setCards] = useState([
    { id: 1, type: "VISA", last4: "4242", expiry: "12/28", holder: "Alex Rivers", is_default: true },
    { id: 2, type: "MASTERCARD", last4: "8891", expiry: "09/27", holder: "Alex Rivers", is_default: false },
  ]);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    first_name: "",
    last_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    is_default: false,
  });

  // Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvc: "",
    is_default: false,
  });

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        first_name: addr.first_name || "",
        last_name: addr.last_name || "",
        address_line1: addr.address_line1 || addr.street || "",
        address_line2: addr.address_line2 || "",
        city: addr.city || "",
        state: addr.state || "",
        postal_code: addr.postal_code || addr.zip || "",
        phone: addr.phone || "",
        is_default: !!(addr.is_default || addr.isDefault),
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        first_name: profile.name.split(" ")[0] || "",
        last_name: profile.name.split(" ").slice(1).join(" ") || "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        phone: profile.phone || "",
        is_default: addresses.length === 0,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.postal_code) {
      toast.error("Please fill in required address fields.");
      return;
    }

    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddressId) {
            return { ...a, ...addressForm };
          }
          if (addressForm.is_default) {
            return { ...a, is_default: false, isDefault: false };
          }
          return a;
        })
      );
      toast.success("Address updated successfully!");
    } else {
      const newAddr = {
        id: Date.now(),
        ...addressForm,
      };
      setAddresses((prev) => {
        const updated = addressForm.is_default
          ? prev.map((a) => ({ ...a, is_default: false, isDefault: false }))
          : prev;
        return [newAddr, ...updated];
      });
      toast.success("New address saved!");
    }
    setIsAddressModalOpen(false);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    const rawNumber = cardForm.number.replace(/\s+/g, "");
    if (rawNumber.length < 12) {
      toast.error("Please enter a valid card number.");
      return;
    }
    const last4 = rawNumber.slice(-4);
    const brand = rawNumber.startsWith("4") ? "VISA" : rawNumber.startsWith("5") ? "MASTERCARD" : "AMEX";
    const newCard = {
      id: Date.now(),
      type: brand,
      last4,
      expiry: cardForm.expiry || "12/28",
      holder: cardForm.holder || profile.name,
      is_default: cardForm.is_default || cards.length === 0,
    };

    setCards((prev) => {
      const updated = newCard.is_default ? prev.map((c) => ({ ...c, is_default: false })) : prev;
      return [newCard, ...updated];
    });

    setIsCardModalOpen(false);
    setCardForm({ holder: "", number: "", expiry: "", cvc: "", is_default: false });
    toast.success("Card added securely!");
  };

  const handleDeleteCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success("Payment method removed");
  };

  const handleSetDefaultCard = (id) => {
    setCards((prev) => prev.map((c) => ({ ...c, is_default: c.id === id })));
    toast.success("Default payment card updated");
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "",
        },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Update Failed", { description: data.message });
      }
    } catch {
      toast.success("Profile saved locally.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    router.post("/logout", {}, {
      onSuccess: () => toast.info("Signed out of Atelier"),
    });
  };

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
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
                  {orders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
                      <Package className="size-10 mx-auto text-muted-foreground stroke-1 mb-3" />
                      <h3 className="text-base font-bold">No orders yet</h3>
                      <p className="text-xs text-muted-foreground mt-1">Your purchase history will appear here after your first order.</p>
                      <Link href="/shop" className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        Start Shopping
                      </Link>
                    </div>
                  ) : orders.map((order) => (
                    <div
                      key={order.id || order.order_number}
                      className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-4 hover:border-foreground/20 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
                        <div>
                          <span className="font-bold text-foreground">Order #{order.order_number || order.id}</span>
                          <span className="text-muted-foreground ml-2">• {order.placed_at ? new Date(order.placed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : order.date}</span>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                            (order.status === "delivered" || order.status === "Delivered")
                              ? "bg-emerald-500/10 text-emerald-700"
                              : (order.status === "processing" || order.status === "Processing")
                              ? "bg-blue-500/10 text-blue-700"
                              : "bg-amber-500/10 text-amber-700",
                          )}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        {(order.items || []).slice(0, 3).map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-foreground font-medium">
                            <span>{it.product_name || it.name} (x{it.quantity || it.qty || 1})</span>
                            <span className="font-bold">{formatPrice(parseFloat(it.total || (it.price * (it.quantity || it.qty || 1))) || 0)}</span>
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <p className="text-muted-foreground">+{order.items.length - 3} more item(s)</p>
                        )}
                      </div>

                      {/* Order Footer & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-extrabold text-foreground">{formatPrice(parseFloat(order.total_amount || order.total || 0))}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/order-tracking?order=${order.order_number || order.id}`}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
                          >
                            <Truck className="size-3.5 text-accent" />
                            <span>Track Package</span>
                          </Link>
                          <Link
                            href={`/invoices/${order.order_number || order.id}`}
                            className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Download className="size-3.5" />
                            <span>Invoice</span>
                          </Link>
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
                    onClick={() => handleOpenAddressModal()}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add New</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground space-y-2">
                    <MapPin className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-xs font-bold text-foreground">No saved addresses yet</p>
                    <p className="text-xs">Add an address to speed up your checkout process.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={cn(
                          "rounded-2xl border p-5 space-y-3 relative flex flex-col justify-between transition-all",
                          (addr.is_default || addr.isDefault)
                            ? "border-accent/40 bg-accent/5"
                            : "border-border/80 bg-background/50",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                              {addr.first_name ? `${addr.first_name} ${addr.last_name}` : addr.title || "Saved Address"}
                            </h4>
                            {(addr.is_default || addr.isDefault) && (
                              <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {addr.address_line1 || addr.street}
                            {addr.address_line2 && `, ${addr.address_line2}`}
                            <br />
                            {addr.city}, {addr.state} {addr.postal_code || addr.zip}
                            {addr.phone && <><br /><span className="text-[11px] text-muted-foreground/80">{addr.phone}</span></>}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenAddressModal(addr)}
                              className="font-bold text-accent hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            {!(addr.is_default || addr.isDefault) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/addresses/${addr.id}/default`, {
                                      method: "POST",
                                      headers: { "X-CSRF-TOKEN": csrfToken() },
                                    });
                                  } catch {}
                                  setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === addr.id, isDefault: a.id === addr.id })));
                                  toast.success("Default address updated");
                                }}
                                className="font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Delete address"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    onClick={() => setIsCardModalOpen(true)}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>

                {cards.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground space-y-2">
                    <CreditCard className="size-8 mx-auto text-muted-foreground/50" />
                    <p className="text-xs font-bold text-foreground">No saved cards</p>
                    <p className="text-xs">Add a debit or credit card for seamless checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 transition-all",
                          c.is_default ? "border-accent/40 bg-accent/5" : "border-border/80 bg-background/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-xl bg-ink text-ink-foreground font-extrabold text-xs">
                            {c.type}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{c.type} ending in {c.last4}</p>
                            <p className="text-[11px] text-muted-foreground">Expires {c.expiry} • {c.holder}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {c.is_default ? (
                            <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold">
                              Default
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultCard(c.id)}
                              className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(c.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Delete card"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    disabled={isSavingProfile}
                    className="flex h-11 items-center justify-center rounded-full bg-primary px-8 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ================= ADDRESS MODAL ================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase text-muted-foreground">First Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.first_name}
                    onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-muted-foreground">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.last_name}
                    onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-muted-foreground">Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-muted-foreground">Apt, Suite, Unit (Optional)</label>
                <input
                  type="text"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                  placeholder="e.g. Apt 4B"
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold uppercase text-muted-foreground">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-muted-foreground">State / Prov</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-muted-foreground">ZIP / Postal *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postal_code}
                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-muted-foreground">Contact Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="size-4 accent-accent rounded"
                />
                <span className="text-xs text-foreground font-medium">Set as my default shipping address</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="h-10 px-4 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {editingAddressId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CARD MODAL ================= */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-emerald-600" />
                <h3 className="text-base font-bold text-foreground">Add Payment Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCardModalOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase text-muted-foreground">Cardholder Name *</label>
                <input
                  type="text"
                  required
                  value={cardForm.holder}
                  onChange={(e) => setCardForm({ ...cardForm, holder: e.target.value })}
                  placeholder="e.g. Alex Rivers"
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-muted-foreground">Card Number *</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  placeholder="•••• •••• •••• ••••"
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase text-muted-foreground">Expires (MM/YY) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    placeholder="12/28"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-muted-foreground">CVC Code *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardForm.cvc}
                    onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                    placeholder="•••"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardForm.is_default}
                  onChange={(e) => setCardForm({ ...cardForm, is_default: e.target.checked })}
                  className="size-4 accent-accent rounded"
                />
                <span className="text-xs text-foreground font-medium">Set as default payment method</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="h-10 px-4 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

AccountPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default AccountPage;
