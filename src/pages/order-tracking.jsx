import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Truck,
  Search,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "ATL-894201";

  const [orderInput, setOrderInput] = useState(initialId);
  const [emailInput, setEmailInput] = useState("alex.rivers@example.com");
  const [isSearching, setIsSearching] = useState(false);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState({
    id: initialId,
    status: "In Transit",
    currentStep: 3, // 1 to 5
    placedDate: "Feb 18, 2026",
    estDelivery: "Feb 24, 2026",
    carrier: "DHL Express Worldwide",
    trackingNumber: "TRK-984210928",
    currentLocation: "Regional Sort Hub — Queens, New York",
    recipient: "Alex Rivers",
    address: "742 Evergreen Terrace, Apt 4B, New York, NY 10001",
    items: [
      { name: "Atelier Studio Headphones", qty: 1, price: 149, color: "Matte Obsidian" },
      { name: "Heavy Rib Cashmere Knit", qty: 1, price: 189, color: "Oatmeal Cream" },
    ],
    timeline: [
      { title: "Order Confirmed & Payment Authorized", time: "Feb 18, 10:14 AM", done: true },
      { title: "Quality Inspection & Eco Packaging", time: "Feb 18, 04:30 PM", done: true },
      { title: "Handed over to DHL Express Hub", time: "Feb 19, 08:45 AM", done: true },
      { title: "Customs Clearance & Regional Transit", time: "Feb 20, 02:15 PM", done: true },
      { title: "Out for Final Mile Delivery", time: "Estimated Tomorrow", done: false },
      { title: "Delivered to Doorstep", time: "Pending", done: false },
    ],
  });

  const handleLookup = (e) => {
    e.preventDefault();
    if (!orderInput.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      toast.success(`Tracking data updated for #${orderInput.trim()}`);
    }, 600);
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
          <span className="font-semibold text-foreground">Track Order</span>
        </nav>

        {/* Header */}
        <div className="border-b border-border pb-6">
          <span className="eyebrow">Real-Time Logistics</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Track Your Shipment
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Enter your Atelier Order Reference number or email to view live delivery checkpoints.
          </p>
        </div>

        {/* Lookup Bar */}
        <form onSubmit={handleLookup} className="mt-6 rounded-3xl border border-border bg-surface p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Order Reference Number
              </label>
              <input
                type="text"
                required
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="e.g. ATL-894201"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-sm uppercase focus:border-accent focus:outline-none"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs"
              >
                <Search className="size-4" />
                <span>{isSearching ? "Searching..." : "Track"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Shipment Tracker Details Card */}
        {activeOrder && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT LOGISTICS TIMELINE (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-foreground">#{activeOrder.id}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Carrier: {activeOrder.carrier}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeOrder.status}
                  </span>
                </div>
              </div>

              {/* ETA Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/40 p-4 border border-border/70">
                <div>
                  <span className="text-[11px] uppercase font-bold text-muted-foreground">Estimated Delivery</span>
                  <h3 className="text-base font-extrabold text-foreground">{activeOrder.estDelivery}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground">Current Hub</span>
                  <p className="text-xs font-semibold text-foreground">{activeOrder.currentLocation}</p>
                </div>
              </div>

              {/* Stepper Visual Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activeOrder.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={cn(
                        "absolute -left-6 top-1 grid size-4.5 place-items-center rounded-full text-[10px] font-bold ring-4 ring-surface",
                        step.done
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {step.done ? <CheckCircle2 className="size-3" /> : idx + 1}
                    </div>
                    <div className="ml-2">
                      <p className={cn("text-xs font-bold", step.done ? "text-foreground" : "text-muted-foreground")}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT ORDER SUMMARY & SUPPORT (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Package Summary */}
              <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-foreground border-b border-border pb-3">
                  Package Contents
                </h3>

                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.color} • Qty: {item.qty}</p>
                      </div>
                      <span className="font-extrabold text-foreground">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">Delivery Destination:</p>
                  <p>{activeOrder.recipient}</p>
                  <p>{activeOrder.address}</p>
                </div>
              </div>

              {/* Need Assistance card */}
              <div className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-accent font-bold text-xs">
                  <HelpCircle className="size-4" />
                  <span>Need Delivery Help?</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">Courier Inquiries & Address Changes</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Need to change your drop-off instructions or hold package at a local collection locker?
                </p>
                <Link
                  to="/contact"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Contact Logistics Support</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
