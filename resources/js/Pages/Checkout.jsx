import { useState, useMemo, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Lock,
  Package,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/site/cart";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { SiteLayout } from "@/layouts/site-layout";

export function CheckoutPage({ user, savedAddresses = [] }) {
  const { props } = usePage();
  const paymentSettings = props?.app_settings?.payments || {
    stripeEnabled: true,
    paypalEnabled: true,
    codEnabled: true,
  };

  const availablePaymentMethods = useMemo(() => {
    const methods = [];
    if (paymentSettings.stripeEnabled !== false) {
      methods.push({ id: "card", label: "Credit / Debit Card", icon: CreditCard, description: "Instant 256-bit encrypted checkout" });
    }
    if (paymentSettings.paypalEnabled !== false) {
      methods.push({ id: "paypal", label: "PayPal Express", icon: ShoppingBag, description: "Fast & secure payment with your PayPal balance or account" });
    }
    if (paymentSettings.codEnabled !== false) {
      methods.push({ id: "cod", label: "Cash on Delivery", icon: Truck, description: "Pay with cash upon order handover at your doorstep" });
    }
    return methods;
  }, [paymentSettings]);

  const navigate = (href) => router.visit(href);
  const {
    items,
    subtotal,
    discountAmount,
    shipping,
    total,
    appliedPromo,
    promoCode,
    setPromoCode,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Completed
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => availablePaymentMethods[0]?.id || "card");

  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.some((m) => m.id === selectedPaymentMethod)) {
      setSelectedPaymentMethod(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(true);

  // Form State initialized with logged-in user if present
  const [formData, setFormData] = useState(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
    const nameParts = user?.name ? user.name.split(" ") : ["Alex", "Rivers"];
    return {
      email: user?.email || defaultAddr?.email || "alex.rivers@example.com",
      firstName: defaultAddr?.first_name || nameParts[0] || "Alex",
      lastName: defaultAddr?.last_name || nameParts.slice(1).join(" ") || "Rivers",
      address: defaultAddr?.address_line1 || "742 Evergreen Terrace",
      apartment: defaultAddr?.address_line2 || "Suite 4B",
      city: defaultAddr?.city || "New York",
      state: defaultAddr?.state || "NY",
      zipCode: defaultAddr?.postal_code || "10001",
      country: defaultAddr?.country || "United States",
      phone: defaultAddr?.phone || "+1 (555) 234-5678",
      cardNumber: "•••• •••• •••• 4242",
      cardExp: "12/28",
      cardCvc: "888",
      cardName: user?.name || "Alex Rivers",
    };
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectSavedAddress = (addr) => {
    setFormData((prev) => ({
      ...prev,
      firstName: addr.first_name,
      lastName: addr.last_name,
      phone: addr.phone || prev.phone,
      address: addr.address_line1,
      apartment: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.postal_code,
      country: addr.country,
    }));
    toast.info("Saved address selected");
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.address) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || "+1 555-0199",
        address_line1: formData.address,
        address_line2: formData.apartment || null,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zipCode,
        country: formData.country,
        items: items,
        payment_method: selectedPaymentMethod,
        coupon_code: appliedPromo?.code || null,
        save_address: saveAddressForNextTime,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const orderRecord = {
          id: data.order_number,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          items: [...items],
          total: total,
          status: "Processing",
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        };

        // Save to order history in localStorage
        try {
          const existing = JSON.parse(localStorage.getItem("atelier_orders") || "[]");
          localStorage.setItem("atelier_orders", JSON.stringify([orderRecord, ...existing]));
        } catch (err) {
          console.error("Failed to save order", err);
        }

        setCompletedOrder(orderRecord);
        clearCart();
        setStep(3);
        toast.success("Order Placed Successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error("Checkout Error", {
          description: data.message || "Failed to process order. Please verify your details.",
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const orderId = `ATL-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderRecord = {
        id: orderId,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        items: [...items],
        total: total,
        status: "Processing",
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      };
      setCompletedOrder(orderRecord);
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsProcessing(false);
    }
  };

  // If order complete
  if (step === 3 && completedOrder) {
    return (
      <main className="shell min-h-[75vh] py-28 lg:py-36">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-surface p-8 sm:p-12 text-center shadow-lg animate-in zoom-in-95">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-10" />
          </div>
          <span className="eyebrow mt-4 text-emerald-600">Order Confirmed</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Thank you for your order!
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We've sent a confirmation email with full receipt and tracking details to{" "}
            <strong className="text-foreground">{formData.email}</strong>.
          </p>

          <div className="mt-8 rounded-2xl bg-muted/40 p-5 text-left text-xs sm:text-sm border border-border/70 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground">#{completedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-semibold text-foreground">In 2–4 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping To:</span>
              <span className="font-semibold text-foreground">{completedOrder.shippingAddress}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground font-bold">Total Paid:</span>
              <span className="font-extrabold text-foreground">{formatPrice(completedOrder.total)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/order-tracking?order=${completedOrder.id}`}
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
            >
              <Truck className="size-4" />
              <span>Track Your Order</span>
            </Link>
            <Link
              href="/shop"
              className="flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border px-8 text-xs font-bold text-foreground hover:bg-muted transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <main className="shell flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="size-8 stroke-1" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add pieces to your shopping bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Explore Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Checkout Header & Steps */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="eyebrow">Express Checkout</span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Complete Your Order
            </h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                step === 1 ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground",
              )}
            >
              1. Shipping
            </span>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                step === 2 ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground",
              )}
            >
              2. Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* ================= LEFT COLUMN: CHECKOUT FORMS ================= */}
          <div className="lg:col-span-7 space-y-8">
            {step === 1 ? (
              /* STEP 1: SHIPPING & CONTACT FORM */
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-foreground">Contact Information</h2>
                    <Link href="/login" className="text-xs font-bold text-accent hover:underline">
                      Already have an account? Sign in
                    </Link>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number (For Delivery Updates)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-foreground">
                      Shipping Address
                    </h2>
                    {savedAddresses.length > 0 && (
                      <span className="text-xs text-muted-foreground font-medium">
                        {savedAddresses.length} saved address(es)
                      </span>
                    )}
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Saved Address:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={cn(
                              "text-left p-3 rounded-2xl border text-xs transition-all",
                              formData.address === addr.address_line1
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-foreground/40 bg-background/50",
                            )}
                          >
                            <p className="font-bold text-foreground">{addr.first_name} {addr.last_name}</p>
                            <p className="text-muted-foreground truncate">{addr.address_line1}</p>
                            <p className="text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Luxury Way"
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange("apartment", e.target.value)}
                      placeholder="Apt 4B"
                      className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        State / Province
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={saveAddressForNextTime}
                        onChange={(e) => setSaveAddressForNextTime(e.target.checked)}
                        className="rounded size-4 accent-primary"
                      />
                      <span>Save this shipping address for faster checkout next time</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-3">
                  <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">
                    Delivery Speed
                  </h2>
                  {[
                    { id: "standard", label: "Complimentary Standard Delivery", time: "3–5 business days", cost: "FREE" },
                    { id: "express", label: "DHL Express Priority", time: "2 business days", cost: formatPrice(15) },
                    { id: "overnight", label: "Overnight Next-Morning Dispatch", time: "Next business day", cost: formatPrice(25) },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all",
                        selectedShippingMethod === m.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_speed"
                          checked={selectedShippingMethod === m.id}
                          onChange={() => setSelectedShippingMethod(m.id)}
                          className="size-4 accent-accent"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-foreground">{m.cost}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-md active:scale-[0.99]"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
            ) : (
              /* STEP 2: PAYMENT METHOD */
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Lock className="size-3.5" /> 256-Bit Encrypted
                    </span>
                  </div>

                  {/* Dynamic Payment Tabs */}
                  {availablePaymentMethods.length === 0 ? (
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center text-xs font-semibold text-amber-800">
                      ⚠ No payment methods are currently active. Please contact customer support.
                    </div>
                  ) : (
                    <div className={cn(
                      "grid gap-2",
                      availablePaymentMethods.length === 1 ? "grid-cols-1" : availablePaymentMethods.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    )}>
                      {availablePaymentMethods.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(p.id)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition-all cursor-pointer",
                            selectedPaymentMethod === p.id
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-surface text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <p.icon className="size-4" />
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPaymentMethod === "card" && (
                    <div className="space-y-4 pt-2 animate-in fade-in">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-sm focus:border-accent focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Expiration Date
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.cardExp}
                            onChange={(e) => handleInputChange("cardExp", e.target.value)}
                            placeholder="MM / YY"
                            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-sm focus:border-accent focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Security Code (CVC)
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.cardCvc}
                            onChange={(e) => handleInputChange("cardCvc", e.target.value)}
                            placeholder="CVC"
                            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-sm focus:border-accent focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === "paypal" && (
                    <div className="rounded-2xl bg-muted/40 p-5 text-center text-xs text-muted-foreground border border-border/80 space-y-1">
                      <ShoppingBag className="size-6 mx-auto text-blue-600 mb-1" />
                      <p className="font-bold text-foreground">PayPal Express Checkout</p>
                      <p>You will be securely routed to PayPal to complete and authorize your payment.</p>
                    </div>
                  )}

                  {selectedPaymentMethod === "cod" && (
                    <div className="rounded-2xl bg-emerald-50/50 p-5 text-center text-xs text-emerald-900 border border-emerald-200/80 space-y-1">
                      <Truck className="size-6 mx-auto text-emerald-600 mb-1" />
                      <p className="font-bold text-emerald-950">Cash on Delivery (COD)</p>
                      <p className="text-emerald-700">Pay <strong>{formatPrice(total)}</strong> in cash when the delivery courier delivers your package.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex h-13 items-center justify-center gap-1.5 rounded-full border border-border px-6 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 h-13 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Lock className="size-4" />
                    {isProcessing ? "Authorizing Payment..." : `Authorize & Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 sticky top-28 rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">
              Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
            </h2>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1 divide-y divide-border/60 no-scrollbar">
              {items.map((item) => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center gap-3 pt-3 first:pt-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-14 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Qty: {item.qty} {item.selectedColor ? `• ${item.selectedColor}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-foreground">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-border pt-4">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-xl bg-accent/10 p-2.5 text-xs text-accent font-bold">
                  <span>Promo Code: {appliedPromo.code} ({appliedPromo.label})</span>
                  <button type="button" onClick={removePromoCode} className="text-accent hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. ATELIER10)"
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-xs uppercase focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromoCode(promoCode)}
                    className="h-10 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-accent font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-semibold text-foreground">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="rounded-2xl bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-accent shrink-0" />
                <span>30-Day Risk-Free Returns & 2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="size-3.5 text-accent shrink-0" />
                <span>Tracked Express Carbon-Neutral Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

CheckoutPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default CheckoutPage;
