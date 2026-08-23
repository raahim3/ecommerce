import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Eye,
  Truck,
  RotateCcw,
  Mail,
  FileText,
  X,
  Check,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Package,
  MessageSquare,
  Printer,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

const CARRIERS = ["DHL Express", "FedEx Priority", "UPS Worldwide", "USPS First Class", "Royal Mail"];
const REFUND_REASONS = ["Customer Request", "Product Damaged", "Wrong Item Shipped", "Order Error", "Goodwill Gesture"];

const MOCK_ORDERS = [
  {
    id: "ATL-894215", date: "Aug 24, 2026 • 10:42 AM",
    customer: { name: "Alex Rivers", email: "alex@example.com", phone: "+1 555-234-5678" },
    shippingAddress: "742 Evergreen Terrace, Apt 4B, New York, NY 10001, USA",
    items: [
      { name: "Atelier Studio Headphones", sku: "ATL-AUD-001", qty: 1, price: 149, color: "Matte Obsidian" },
      { name: "Heavy Rib Cashmere Knit", sku: "ATL-KNT-003", qty: 1, price: 189, color: "Oatmeal Cream", size: "M" },
    ],
    subtotal: 338, shipping: 0, tax: 27.04, discount: 33.8, total: 331.24,
    promoCode: "ATELIER10",
    paymentStatus: "Paid", paymentMethod: "Visa ending in 4242",
    fulfillmentStatus: "Unfulfilled", trackingNumber: "", carrier: "",
    notes: [],
  },
  {
    id: "ATL-894214", date: "Aug 24, 2026 • 08:15 AM",
    customer: { name: "Sofia Lindqvist", email: "sofia@nordic.se", phone: "+46 70 123 4567" },
    shippingAddress: "Storgatan 42, 2nd Floor, Stockholm, Sweden",
    items: [
      { name: "Meridian Steel Watch", sku: "ATL-WTC-001", qty: 1, price: 320, color: "Silver & Obsidian" },
    ],
    subtotal: 320, shipping: 15, tax: 26.75, discount: 0, total: 361.75,
    promoCode: "",
    paymentStatus: "Paid", paymentMethod: "PayPal",
    fulfillmentStatus: "In Transit", trackingNumber: "TRK-98421992", carrier: "DHL Express",
    notes: [{ author: "Sarah (Admin)", text: "Customer requested signature on delivery", time: "Aug 24, 09:30 AM" }],
  },
  {
    id: "ATL-894213", date: "Aug 23, 2026 • 06:48 PM",
    customer: { name: "Marcus Vance", email: "m.vance@studio.co", phone: "+44 20 7123 4567" },
    shippingAddress: "180 Varick Street, Floor 8, New York, NY 10014, USA",
    items: [
      { name: "Heavy Rib Cashmere Knit", sku: "ATL-KNT-003", qty: 2, price: 189, color: "Slate Grey", size: "L" },
    ],
    subtotal: 378, shipping: 0, tax: 30.24, discount: 0, total: 408.24,
    promoCode: "",
    paymentStatus: "Paid", paymentMethod: "Mastercard ending in 8812",
    fulfillmentStatus: "Fulfilled", trackingNumber: "TRK-77284910", carrier: "FedEx Priority",
    notes: [],
  },
  {
    id: "ATL-894212", date: "Aug 23, 2026 • 02:20 PM",
    customer: { name: "Elena Rostova", email: "elena@design.de", phone: "+49 30 1234567" },
    shippingAddress: "Kurfürstendamm 150, Berlin, Germany 10709",
    items: [
      { name: "Court Leather Sneakers", sku: "ATL-SNK-001", qty: 1, price: 165, color: "Chalk White", size: "EU 40" },
    ],
    subtotal: 165, shipping: 25, tax: 15.2, discount: 0, total: 205.2,
    promoCode: "",
    paymentStatus: "Pending", paymentMethod: "Klarna",
    fulfillmentStatus: "Unfulfilled", trackingNumber: "", carrier: "",
    notes: [],
  },
  {
    id: "ATL-894211", date: "Aug 23, 2026 • 11:55 AM",
    customer: { name: "Julian Thorne", email: "j.thorne@london.uk", phone: "+44 7911 123456" },
    shippingAddress: "10 Downing Mews, Chelsea, London, SW1A 2AA, UK",
    items: [
      { name: "Everyday Leather Tote", sku: "ATL-BAG-001", qty: 1, price: 215, color: "Cognac Tan" },
      { name: "Botanica Hinoki Diffuser", sku: "ATL-DIF-001", qty: 1, price: 95, color: "Natural Hinoki" },
    ],
    subtotal: 310, shipping: 0, tax: 24.8, discount: 0, total: 334.8,
    promoCode: "",
    paymentStatus: "Refunded", paymentMethod: "Visa ending in 9191",
    fulfillmentStatus: "Cancelled", trackingNumber: "", carrier: "",
    notes: [{ author: "Mike (Support)", text: "Customer requested cancellation before dispatch", time: "Aug 23, 01:00 PM" }],
  },
];

const STATUS_TABS = ["All Orders", "Unfulfilled", "In Transit", "Fulfilled", "Pending Payment", "Cancelled"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState("All Orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [fulfillData, setFulfillData] = useState({ carrier: CARRIERS[0], trackingNumber: "" });
  const [refundData, setRefundData] = useState({ amount: "", reason: REFUND_REASONS[0] });
  const [newNote, setNewNote] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "Unfulfilled" && order.fulfillmentStatus !== "Unfulfilled") return false;
      if (activeTab === "In Transit" && order.fulfillmentStatus !== "In Transit") return false;
      if (activeTab === "Fulfilled" && order.fulfillmentStatus !== "Fulfilled") return false;
      if (activeTab === "Pending Payment" && order.paymentStatus !== "Pending") return false;
      if (activeTab === "Cancelled" && order.fulfillmentStatus !== "Cancelled") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return order.id.toLowerCase().includes(q) || order.customer.name.toLowerCase().includes(q) || order.customer.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const handleFulfill = () => {
    if (!fulfillData.trackingNumber.trim()) { toast.error("Tracking number is required to mark as fulfilled."); return; }
    setOrders((prev) => prev.map((o) =>
      o.id === selectedOrder.id
        ? { ...o, fulfillmentStatus: "In Transit", trackingNumber: fulfillData.trackingNumber, carrier: fulfillData.carrier }
        : o
    ));
    setSelectedOrder((prev) => ({ ...prev, fulfillmentStatus: "In Transit", ...fulfillData }));
    toast.success(`Order #${selectedOrder.id} marked as Dispatched`, {
      description: `${fulfillData.carrier} • Tracking: ${fulfillData.trackingNumber}`,
    });
    setFulfillModalOpen(false);
  };

  const handleRefund = () => {
    if (!refundData.amount) { toast.error("Enter a refund amount."); return; }
    setOrders((prev) => prev.map((o) =>
      o.id === selectedOrder.id ? { ...o, paymentStatus: "Refunded", fulfillmentStatus: "Cancelled" } : o
    ));
    setSelectedOrder((prev) => ({ ...prev, paymentStatus: "Refunded", fulfillmentStatus: "Cancelled" }));
    toast.success(`Refund of ${formatPrice(Number(refundData.amount))} issued for order #${selectedOrder.id}`);
    setRefundModalOpen(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = { author: "You (Admin)", text: newNote, time: "Just now" };
    setOrders((prev) => prev.map((o) =>
      o.id === selectedOrder.id ? { ...o, notes: [...o.notes, note] } : o
    ));
    setSelectedOrder((prev) => ({ ...prev, notes: [...(prev.notes || []), note] }));
    toast.success("Note added to order.");
    setNewNote("");
    setNoteModalOpen(false);
  };

  const countForTab = (tab) => {
    if (tab === "All Orders") return orders.length;
    if (tab === "Unfulfilled") return orders.filter((o) => o.fulfillmentStatus === "Unfulfilled").length;
    if (tab === "In Transit") return orders.filter((o) => o.fulfillmentStatus === "In Transit").length;
    if (tab === "Fulfilled") return orders.filter((o) => o.fulfillmentStatus === "Fulfilled").length;
    if (tab === "Pending Payment") return orders.filter((o) => o.paymentStatus === "Pending").length;
    if (tab === "Cancelled") return orders.filter((o) => o.fulfillmentStatus === "Cancelled").length;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">Process, fulfill, and manage all customer orders.</p>
        </div>
        <button
          type="button"
          onClick={() => toast.success("Exporting orders CSV...")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Download className="size-3.5" /> Export Orders CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto gap-1 no-scrollbar border-b border-slate-200 pb-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-bold border-b-2 transition-all",
              activeTab === tab
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500")}>
              {countForTab(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID, customer name, or email..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 text-xs focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4 hidden md:table-cell">Items</th>
                <th className="p-4 hidden sm:table-cell">Date</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <button type="button" onClick={() => setSelectedOrder(order)} className="font-mono font-bold text-violet-700 hover:underline">
                      #{order.id}
                    </button>
                    {order.notes?.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        <MessageSquare className="size-2.5" /> {order.notes.length}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{order.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{order.customer.email}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell max-w-[200px] truncate text-slate-600">
                    {order.items.map((i) => i.name).join(", ")}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-500 whitespace-nowrap">{order.date}</td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                      order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      order.paymentStatus === "Refunded" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                      order.fulfillmentStatus === "Fulfilled" || order.fulfillmentStatus === "In Transit" ? "bg-sky-50 text-sky-700 border-sky-200" :
                      order.fulfillmentStatus === "Unfulfilled" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-slate-900">{formatPrice(order.total)}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ORDER DETAIL DRAWER ===== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order #{selectedOrder.id}</h2>
                <p className="text-xs text-slate-500">{selectedOrder.date}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="grid size-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 px-8 py-6 space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-xs font-bold",
                  selectedOrder.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  selectedOrder.paymentStatus === "Refunded" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                )}>
                  Payment: {selectedOrder.paymentStatus}
                </span>
                <span className={cn("rounded-full border px-3 py-1 text-xs font-bold",
                  selectedOrder.fulfillmentStatus === "Fulfilled" || selectedOrder.fulfillmentStatus === "In Transit" ? "bg-sky-50 text-sky-700 border-sky-200" :
                  selectedOrder.fulfillmentStatus === "Unfulfilled" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  Fulfillment: {selectedOrder.fulfillmentStatus}
                </span>
                {selectedOrder.trackingNumber && (
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                    {selectedOrder.carrier} • {selectedOrder.trackingNumber}
                  </span>
                )}
              </div>

              {/* Order Items */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Items Ordered</h3>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.name} × {item.qty}</p>
                      <p className="text-slate-400">{[item.color, item.size].filter(Boolean).join(" • ")} • {item.sku}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="space-y-1.5 text-xs pt-2">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount ({selectedOrder.promoCode})</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                  <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{selectedOrder.shipping === 0 ? "Free" : formatPrice(selectedOrder.shipping)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Tax (8%)</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-200 pt-2"><span>Total Charged</span><span>{formatPrice(selectedOrder.total)}</span></div>
                </div>
              </div>

              {/* Customer + Shipping */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Customer</h4>
                  <p className="font-semibold text-slate-800">{selectedOrder.customer.name}</p>
                  <p className="text-slate-500">{selectedOrder.customer.email}</p>
                  <p className="text-slate-500">{selectedOrder.customer.phone}</p>
                  <p className="text-slate-400">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Ship To</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Staff Notes</h4>
                  {selectedOrder.notes.map((note, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-slate-700">{note.author}</span>
                        <span className="text-slate-400">{note.time}</span>
                      </div>
                      <p className="text-slate-600">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-8 py-4 flex flex-wrap items-center gap-2">
              {selectedOrder.fulfillmentStatus === "Unfulfilled" && (
                <button
                  type="button"
                  onClick={() => setFulfillModalOpen(true)}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Truck className="size-3.5" /> Mark Fulfilled
                </button>
              )}
              {selectedOrder.paymentStatus === "Paid" && (
                <button
                  type="button"
                  onClick={() => { setRefundData({ amount: selectedOrder.total.toFixed(2), reason: REFUND_REASONS[0] }); setRefundModalOpen(true); }}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="size-3.5" /> Issue Refund
                </button>
              )}
              <button
                type="button"
                onClick={() => toast.success("Order confirmation email resent.")}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Mail className="size-3.5" /> Resend Email
              </button>
              <button
                type="button"
                onClick={() => toast.success("Packing slip generated and sent to printer.")}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5" /> Print Packing Slip
              </button>
              <button
                type="button"
                onClick={() => toast.success("Tax invoice PDF downloaded.")}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="size-3.5" /> Download Invoice
              </button>
              <button
                type="button"
                onClick={() => setNoteModalOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <MessageSquare className="size-3.5" /> Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfill Modal */}
      {fulfillModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setFulfillModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl animate-in zoom-in-95 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Fulfill Order #{selectedOrder?.id}</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping Carrier</label>
              <select
                value={fulfillData.carrier}
                onChange={(e) => setFulfillData((f) => ({ ...f, carrier: e.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none"
              >
                {CARRIERS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tracking Number *</label>
              <input
                type="text"
                value={fulfillData.trackingNumber}
                onChange={(e) => setFulfillData((f) => ({ ...f, trackingNumber: e.target.value }))}
                placeholder="e.g. TRK-98421992"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-xs uppercase focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setFulfillModalOpen(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={handleFulfill} className="flex-1 h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800">Mark as Dispatched</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setRefundModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-red-200 p-8 shadow-2xl animate-in zoom-in-95 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Issue Refund — #{selectedOrder?.id}</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Refund Amount</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={refundData.amount}
                  onChange={(e) => setRefundData((f) => ({ ...f, amount: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 text-sm font-bold focus:border-red-400 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Order total: {formatPrice(selectedOrder?.total)}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Refund Reason</label>
              <select
                value={refundData.reason}
                onChange={(e) => setRefundData((f) => ({ ...f, reason: e.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-red-400 focus:outline-none"
              >
                {REFUND_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setRefundModalOpen(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={handleRefund} className="flex-1 h-10 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700">Issue Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setNoteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-slate-200 p-8 shadow-2xl animate-in zoom-in-95 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Add Internal Staff Note</h2>
            <textarea
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Customer requested gift wrapping and a personal message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-900 focus:outline-none resize-none"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setNoteModalOpen(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">Cancel</button>
              <button type="button" onClick={handleAddNote} className="flex-1 h-10 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800">Add Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
