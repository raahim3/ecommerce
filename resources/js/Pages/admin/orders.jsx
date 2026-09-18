import { useState, useMemo, useEffect } from "react";
import { usePage } from "@inertiajs/react";
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
  Receipt,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { downloadCsv } from "@/lib/export-csv";
import { AdminLayout } from "@/layouts/admin-layout";

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

export function AdminOrdersPage({ orders: serverOrders = { data: [], links: [] }, filters = {}, orderProducts = [], orderCustomers = [], orderShippingMethods = [], orderCountries = ["Pakistan"], orderPaymentMethods = [], orderStatuses = [] }) {
  // Use only persisted orders.
  const serverData = serverOrders?.data ?? [];
  const [orders, setOrders] = useState(serverData.length > 0 ? serverData.map((o) => ({
    id: o.order_number,
    _serverId: o.id,
    date: new Date(o.placed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
    customer: { name: o.customer_name, email: o.customer_email, phone: o.customer_phone ?? "" },
    shippingAddress: o.shipping_address ? `${o.shipping_address.address_line1}, ${o.shipping_address.city}, ${o.shipping_address.state} ${o.shipping_address.postal_code}` : "",
    items: (o.items ?? []).map((it) => ({ name: it.product_name, sku: it.sku ?? "", qty: it.quantity, price: parseFloat(it.price), color: it.selected_color ?? "", size: it.selected_size ?? "" })),
    subtotal: parseFloat(o.subtotal_amount ?? 0),
    shipping: parseFloat(o.shipping_amount ?? 0),
    tax: parseFloat(o.tax_amount ?? 0),
    discount: parseFloat(o.discount_amount ?? 0),
    total: parseFloat(o.total_amount ?? 0),
    promoCode: o.coupon_code ?? "",
    paymentStatus: o.payment_status === "paid" ? "Paid" : o.payment_status === "refunded" ? "Refunded" : "Pending",
    paymentMethod: o.payment_method ?? "Card",
    paymentReceiptUrl: o.payment_receipt_url ?? "",
    fulfillmentStatus: o.status === "delivered" ? "Fulfilled" : o.status === "shipped" ? "In Transit" : o.status === "cancelled" ? "Cancelled" : "Unfulfilled",
    trackingNumber: o.tracking_number ?? "",
    carrier: o.carrier ?? "",
    notes: (() => {
      try {
        const parsed = JSON.parse(o.notes || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return o.notes ? [{ author: "System", text: o.notes, time: "" }] : [];
      }
    })(),
  })) : []);

  const [activeTab, setActiveTab] = useState("All Orders");
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [fulfillData, setFulfillData] = useState({ carrier: CARRIERS[0], trackingNumber: "" });
  const [refundData, setRefundData] = useState({ amount: "", reason: REFUND_REASONS[0] });
  const [newNote, setNewNote] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const { props } = usePage();
  const paymentSettings = props?.app_settings?.payments || {};
  const availablePaymentMethods = orderPaymentMethods.length > 0 ? orderPaymentMethods : [
    ...(paymentSettings.stripeEnabled !== false ? [{ id: "card", label: "Credit / Debit Card" }] : []),
    ...(paymentSettings.paypalEnabled !== false ? [{ id: "paypal", label: "PayPal" }] : []),
    ...(paymentSettings.codEnabled !== false ? [{ id: "cod", label: "Cash on Delivery" }] : []),
    ...(paymentSettings.bankTransferEnabled ? [{ id: "bank_transfer", label: "Bank Transfer" }] : []),
  ];
  const availableOrderStatuses = orderStatuses.length > 0 ? orderStatuses : [
    { id: "pending", label: "Pending" }, { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" }, { id: "delivered", label: "Delivered" }, { id: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    setNewOrder((current) => ({
      ...current,
      payment_method: availablePaymentMethods.some((method) => method.id === current.payment_method)
        ? current.payment_method
        : (availablePaymentMethods[0]?.id || ""),
      status: availableOrderStatuses.some((status) => status.id === current.status)
        ? current.status
        : (availableOrderStatuses[0]?.id || ""),
    }));
  }, [orderPaymentMethods, orderStatuses, paymentSettings]);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [couponState, setCouponState] = useState({ status: "idle", discount: 0, message: "" });
  const [newOrder, setNewOrder] = useState({
    customer_id: "", first_name: "", last_name: "", email: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", postal_code: "", country: orderCountries[0] || "Pakistan", items: [{ product_id: "", quantity: 1, selected_color: "", selected_size: "" }],
    shipping_method: orderShippingMethods[0]?.code || "standard", payment_method: orderPaymentMethods[0]?.id || "cod", payment_status: "unpaid", status: orderStatuses[0]?.id || "pending",
    coupon_code: "", payment_receipt_url: "", notes: "", send_confirmation: false,
  });
  const [orderStates, setOrderStates] = useState([]);
  const [orderCities, setOrderCities] = useState([]);
  const [loadingOrderStates, setLoadingOrderStates] = useState(false);
  const [loadingOrderCities, setLoadingOrderCities] = useState(false);

  useEffect(() => {
    if (!createOrderOpen || !newOrder.country) return undefined;
    let mounted = true;
    setLoadingOrderStates(true);
    setOrderStates([]);
    setOrderCities([]);
    fetch(`/api/countries/${encodeURIComponent(newOrder.country)}/states`)
      .then((response) => response.json())
      .then((states) => {
        if (!mounted) return;
        setOrderStates(Array.isArray(states) ? states : []);
        setNewOrder((current) => ({ ...current, state: "", city: "" }));
      })
      .catch(() => mounted && setOrderStates([]))
      .finally(() => mounted && setLoadingOrderStates(false));
    return () => { mounted = false; };
  }, [createOrderOpen, newOrder.country]);

  useEffect(() => {
    if (!createOrderOpen || !newOrder.state) {
      setOrderCities([]);
      return undefined;
    }
    let mounted = true;
    setLoadingOrderCities(true);
    fetch(`/api/states/${encodeURIComponent(newOrder.state)}/cities?country=${encodeURIComponent(newOrder.country)}`)
      .then((response) => response.json())
      .then((cities) => mounted && setOrderCities(Array.isArray(cities) ? cities : []))
      .catch(() => mounted && setOrderCities([]))
      .finally(() => mounted && setLoadingOrderCities(false));
    return () => { mounted = false; };
  }, [createOrderOpen, newOrder.country, newOrder.state]);

  const createOrderSubtotal = useMemo(() => newOrder.items.reduce((sum, item) => {
    const product = orderProducts.find((candidate) => String(candidate.id) === String(item.product_id));
    return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
  }, 0), [newOrder.items, orderProducts]);

  const openCreateOrder = () => {
    setNewOrder((current) => ({ ...current, customer_id: "", first_name: "", last_name: "", email: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", items: [{ product_id: "", quantity: 1, selected_color: "", selected_size: "" }], coupon_code: "", payment_receipt_url: "", notes: "", send_confirmation: false }));
    setCreateOrderOpen(true);
  };

  const selectOrderCustomer = (customerId) => {
    const customer = orderCustomers.find((candidate) => String(candidate.id) === String(customerId));
    const nameParts = customer?.name?.trim().split(/\s+/) || [];
    setNewOrder((current) => ({ ...current, customer_id: customerId, first_name: nameParts[0] || "", last_name: nameParts.slice(1).join(" "), email: customer?.email || "" }));
  };

  const updateNewOrder = (field, value) => {
    setNewOrder((current) => ({ ...current, [field]: value }));
    if (field === "coupon_code") setCouponState({ status: "idle", discount: 0, message: "" });
  };
  const applyOrderCoupon = async () => {
    const code = newOrder.coupon_code.trim();
    if (!code) return setCouponState({ status: "idle", discount: 0, message: "" });
    setCouponState({ status: "checking", discount: 0, message: "Checking coupon..." });
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify({ code, subtotal: createOrderSubtotal }),
      });
      const result = await response.json();
      if (!response.ok || !result.valid) throw new Error(result.message || "Coupon is not valid.");
      updateNewOrder("coupon_code", result.code);
      setCouponState({ status: "valid", discount: Number(result.discount_amount || 0), message: result.message });
    } catch (error) {
      setCouponState({ status: "invalid", discount: 0, message: error.message || "Coupon is not valid." });
    }
  };

  const uploadOrderReceipt = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/checkout/upload-receipt", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrfToken() }, body: formData });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.message || "Receipt upload failed.");
      updateNewOrder("payment_receipt_url", result.url);
      toast.success("Payment receipt uploaded.");
    } catch (error) {
      toast.error(error.message || "Receipt upload failed.");
    } finally {
      setIsUploadingReceipt(false);
      event.target.value = "";
    }
  };
  const updateOrderItem = (index, field, value) => {
    setNewOrder((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
    setCouponState({ status: "idle", discount: 0, message: "" });
  };
  const addOrderItem = () => {
    setNewOrder((current) => ({ ...current, items: [...current.items, { product_id: "", quantity: 1, selected_color: "", selected_size: "" }] }));
    setCouponState({ status: "idle", discount: 0, message: "" });
  };
  const removeOrderItem = (index) => {
    setNewOrder((current) => ({ ...current, items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index) }));
    setCouponState({ status: "idle", discount: 0, message: "" });
  };

  const submitNewOrder = async (event) => {
    event.preventDefault();
    setIsCreatingOrder(true);
    try {
      const response = await fetch("/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify(newOrder),
      });
      const result = await response.json();
      if (!response.ok) {
        const firstError = result.errors ? Object.values(result.errors).flat()[0] : result.message;
        throw new Error(firstError || "Order could not be created.");
      }
      toast.success(result.message);
      setCreateOrderOpen(false);
      setCouponState({ status: "idle", discount: 0, message: "" });
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Order could not be created.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

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

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const handleFulfill = async () => {
    if (!fulfillData.trackingNumber.trim()) { toast.error("Tracking number is required to mark as fulfilled."); return; }
    const serverId = selectedOrder._serverId;
    if (serverId) {
      try {
        const res = await fetch(`/admin/orders/${serverId}/tracking`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
          body: JSON.stringify({ tracking_number: fulfillData.trackingNumber, carrier: fulfillData.carrier }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.message || "Failed to update order tracking. Please try again.");
          return;
        }
      } catch {
        toast.error("Network error — could not save tracking information.");
        return;
      }
    } else {
      toast.warning("Demo order — tracking saved locally only (not persisted to database).");
    }
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

  const updateOrder = async (endpoint, body, successMessage) => {
    const serverId = selectedOrder?._serverId;
    if (!serverId) {
      toast.warning("Demo order — this change is not persisted to the database.");
      return false;
    }

    try {
      const res = await fetch(`/admin/orders/${serverId}/${endpoint}`, {
        method: endpoint === "status" || endpoint === "payment" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to update order.");
        return false;
      }
      toast.success(successMessage);
      return true;
    } catch {
      toast.error("Network error — could not update the order.");
      return false;
    }
  };

  const handleMarkFulfilled = async () => {
    const updated = await updateOrder("status", { status: "delivered" }, `Order #${selectedOrder.id} marked as fulfilled.`);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, fulfillmentStatus: "Fulfilled" } : o));
    setSelectedOrder((prev) => ({ ...prev, fulfillmentStatus: "Fulfilled" }));
  };

  const handleCancel = async () => {
    const updated = await updateOrder("status", { status: "cancelled" }, `Order #${selectedOrder.id} cancelled.`);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, fulfillmentStatus: "Cancelled" } : o));
    setSelectedOrder((prev) => ({ ...prev, fulfillmentStatus: "Cancelled" }));
  };

  const handleMarkPaid = async () => {
    const updated = await updateOrder("payment", { payment_status: "paid" }, `Order #${selectedOrder.id} marked as paid.`);
    if (!updated) return;
    setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, paymentStatus: "Paid" } : o));
    setSelectedOrder((prev) => ({ ...prev, paymentStatus: "Paid" }));
  };

  const handleRefund = async () => {
    if (!refundData.amount) { toast.error("Enter a refund amount."); return; }
    const updated = await updateOrder("payment", { payment_status: "refunded" }, `Refund of ${formatPrice(Number(refundData.amount))} issued for order #${selectedOrder.id}`);
    if (!updated) return;
    setOrders((prev) => prev.map((o) =>
      o.id === selectedOrder.id ? { ...o, paymentStatus: "Refunded", fulfillmentStatus: "Cancelled" } : o
    ));
    setSelectedOrder((prev) => ({ ...prev, paymentStatus: "Refunded", fulfillmentStatus: "Cancelled" }));
    setRefundModalOpen(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const serverId = selectedOrder?._serverId;
    if (!serverId) {
      toast.warning("Demo order — note was not saved to the database.");
      return;
    }

    fetch(`/admin/orders/${serverId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken() },
      body: JSON.stringify({ note: newNote }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save note.");
        return;
      }
      const data = await res.json();
      const note = data.notes?.at(-1) || { author: "Admin", text: newNote, time: "Just now" };
      setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, notes: data.notes } : o));
      setSelectedOrder((prev) => ({ ...prev, notes: data.notes }));
      toast.success("Note saved to order.");
      setNewNote("");
      setNoteModalOpen(false);
    }).catch(() => toast.error("Network error — could not save note."));
  };

  const handleResendEmail = async () => {
    const updated = await updateOrder("resend-email", {}, "Order confirmation email sent.");
    if (updated) return;
  };

  const handlePrintPackingSlip = () => {
    if (!selectedOrder?._serverId) {
      toast.warning("Demo order — packing slip is not available.");
      return;
    }
    window.open(`/admin/orders/${selectedOrder._serverId}/packing-slip`, "_blank", "noopener,noreferrer");
  };

  const handleDownloadInvoice = () => {
    window.open(`/invoices/${selectedOrder.id}`, "_blank", "noopener,noreferrer");
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
        <div className="flex items-center gap-2">
        <button type="button" onClick={openCreateOrder} className="flex h-9 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-slate-800">
          <Plus className="size-3.5" /> Create Order
        </button>
        <button
          type="button"
          onClick={() => {
            if (orders.length === 0) { toast.info("No orders to export."); return; }
            const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Items Count", "Total Amount", "Payment Status", "Fulfillment Status", "Tracking Number"];
            const rows = orders.map((o) => [
              o.id,
              o.date,
              o.customer?.name || o.customer || "",
              o.customer?.email || "",
              o.items?.length || 1,
              o.total,
              o.paymentStatus,
              o.fulfillmentStatus,
              o.trackingNumber || "",
            ]);
            downloadCsv("store_orders_export", headers, rows);
            toast.success(`Exported ${orders.length} orders to CSV!`);
          }}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Download className="size-3.5" /> Export Orders CSV
        </button>
        </div>
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
                    {order.paymentReceiptUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingReceipt(order.paymentReceiptUrl);
                        }}
                        className="ml-1.5 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        title="Click to view uploaded receipt"
                      >
                        <Receipt className="size-2.5" /> Slip
                      </button>
                    )}
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

      {createOrderOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
          <form onSubmit={submitNewOrder} className="flex min-w-0 max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white sm:px-8 sm:py-5">
              <div><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-xl bg-white/10"><Plus className="size-4" /></span><h2 className="text-lg font-bold">Create Order</h2></div><p className="mt-1.5 text-xs text-slate-400">Build an order for a registered customer or a guest.</p></div>
              <button type="button" onClick={() => setCreateOrderOpen(false)} className="grid size-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
            </div>
            <div className="grid min-w-0 flex-1 gap-5 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,250px)]">
              <div className="min-w-0 space-y-6">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Step 01</p><h3 className="mt-1 text-sm font-bold text-slate-900">Customer details</h3></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">Guest or existing</span></div>
                  <select value={newOrder.customer_id} onChange={(event) => selectOrderCustomer(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-slate-900 focus:bg-white">
                    <option value="">Guest customer</option>{orderCustomers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} — {customer.email}</option>)}
                  </select>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[["first_name", "First name *"], ["last_name", "Last name"]].map(([field, label]) => <input key={field} required={field === "first_name"} value={newOrder[field]} onChange={(event) => updateNewOrder(field, event.target.value)} placeholder={label} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />)}
                    <input required type="email" value={newOrder.email} onChange={(event) => updateNewOrder("email", event.target.value)} placeholder="Email address *" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />
                    <input required value={newOrder.phone} onChange={(event) => updateNewOrder("phone", event.target.value)} placeholder="Phone number *" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Step 02</p><h3 className="mt-1 text-sm font-bold text-slate-900">Shipping address</h3></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required value={newOrder.address_line1} onChange={(event) => updateNewOrder("address_line1", event.target.value)} placeholder="Address line 1 *" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs sm:col-span-2 focus:border-slate-900 focus:outline-none" />
                    <input value={newOrder.address_line2} onChange={(event) => updateNewOrder("address_line2", event.target.value)} placeholder="Apartment, suite (optional)" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs sm:col-span-2 focus:border-slate-900 focus:outline-none" />
                    <select required value={newOrder.state} disabled={loadingOrderStates} onChange={(event) => updateNewOrder("state", event.target.value)} className="min-w-0 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none disabled:cursor-wait disabled:opacity-60"><option value="">{loadingOrderStates ? "Loading provinces..." : "Select province / state *"}</option>{orderStates.map((state) => <option key={state.id ?? state.name} value={state.name}>{state.name}</option>)}</select>
                    <select required value={newOrder.city} disabled={!newOrder.state || loadingOrderCities} onChange={(event) => updateNewOrder("city", event.target.value)} className="min-w-0 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"><option value="">{loadingOrderCities ? "Loading cities..." : "Select city *"}</option>{orderCities.map((city) => <option key={city.id ?? city.name} value={city.name}>{city.name}</option>)}</select>
                    <input required value={newOrder.postal_code} onChange={(event) => updateNewOrder("postal_code", event.target.value)} placeholder="Postal code *" className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />
                    <select required value={newOrder.country} onChange={(event) => updateNewOrder("country", event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none">{orderCountries.map((country) => <option key={country} value={country}>{country}</option>)}</select>
                  </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Step 03</p><h3 className="mt-1 text-sm font-bold text-slate-900">Order items</h3></div><button type="button" onClick={addOrderItem} className="flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-2.5 text-[11px] font-bold text-white hover:bg-slate-800"><Plus className="size-3.5" /> Add item</button></div>
                  <div className="space-y-3">
                    {newOrder.items.map((item, index) => {
                      const product = orderProducts.find((candidate) => String(candidate.id) === String(item.product_id));
                      return <div key={index} className="grid min-w-0 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_64px_36px]">
                        <select required value={item.product_id} onChange={(event) => updateOrderItem(index, "product_id", event.target.value)} className="min-w-0 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-slate-900 focus:outline-none"><option value="">Select product *</option>{orderProducts.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} — {formatPrice(candidate.price)} ({candidate.stock_quantity} in stock)</option>)}</select>
                        <input required type="number" min="1" max={product?.stock_quantity || 100} value={item.quantity} onChange={(event) => updateOrderItem(index, "quantity", event.target.value)} className="min-w-0 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-slate-900 focus:outline-none" />
                        <button type="button" onClick={() => removeOrderItem(index)} className="grid size-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                        {product && <div className="grid gap-2 sm:col-span-3 sm:grid-cols-2">{(product.available_colors?.length > 0 || product.variants?.some((variant) => variant.color_name)) && <select value={item.selected_color} onChange={(event) => updateOrderItem(index, "selected_color", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px]"><option value="">Color (optional)</option>{[...new Set((product.available_colors || []).concat((product.variants || []).map((variant) => variant.color_name).filter(Boolean)))].map((color) => <option key={color} value={color}>{color}</option>)}</select>}{(product.available_sizes?.length > 0 || product.variants?.some((variant) => variant.size)) && <select value={item.selected_size} onChange={(event) => updateOrderItem(index, "selected_size", event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px]"><option value="">Size (optional)</option>{[...new Set((product.available_sizes || []).concat((product.variants || []).map((variant) => variant.size).filter(Boolean)))].map((size) => <option key={size} value={size}>{size}</option>)}</select>}</div>}
                      </div>;
                    })}
                  </div>
                </section>
              </div>

              <div className="min-w-0 space-y-5 lg:sticky lg:top-0 lg:self-start">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Step 04</p><h3 className="mt-1 text-sm font-bold text-slate-900">Delivery & payment</h3></div>
                  <select required value={newOrder.shipping_method} onChange={(event) => updateNewOrder("shipping_method", event.target.value)} className="min-w-0 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"><option value="">Shipping method *</option>{orderShippingMethods.map((method) => <option key={method.code} value={method.code}>{method.name}</option>)}</select>
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1"><select required={availablePaymentMethods.length > 0} value={newOrder.payment_method} onChange={(event) => updateNewOrder("payment_method", event.target.value)} className="min-w-0 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"><option value="">{availablePaymentMethods.length ? "Select payment method" : "No payment methods enabled"}</option>{availablePaymentMethods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}</select><select value={newOrder.payment_status} onChange={(event) => updateNewOrder("payment_status", event.target.value)} className="min-w-0 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"><option value="unpaid">Payment unpaid</option><option value="paid">Payment paid</option><option value="refunded">Refunded</option></select></div>
                  <select required value={newOrder.status} onChange={(event) => updateNewOrder("status", event.target.value)} className="min-w-0 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"><option value="">Select order status</option>{availableOrderStatuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select>
                  <div className="space-y-2"><input id="admin-order-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={uploadOrderReceipt} className="sr-only" /><label htmlFor="admin-order-receipt" className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-600 transition-colors hover:border-slate-900 hover:bg-white"><Upload className="size-3.5" />{isUploadingReceipt ? "Uploading receipt..." : "Upload payment receipt"}</label>{newOrder.payment_receipt_url && <p className="truncate rounded-lg bg-emerald-50 px-2.5 py-2 text-[11px] font-semibold text-emerald-700">Receipt uploaded: {newOrder.payment_receipt_url.split("/").pop()}</p>}</div>
                </section>
                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Step 05</p><h3 className="mt-1 text-sm font-bold text-slate-900">Order details</h3></div><div className="flex gap-2"><input value={newOrder.coupon_code} onChange={(event) => updateNewOrder("coupon_code", event.target.value)} placeholder="Coupon code" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs uppercase outline-none focus:border-slate-900 focus:bg-white" /><button type="button" onClick={applyOrderCoupon} disabled={couponState.status === "checking" || !newOrder.coupon_code.trim()} className="h-11 shrink-0 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white disabled:opacity-40">{couponState.status === "checking" ? "Checking..." : "Apply"}</button></div>{couponState.message && <p className={cn("text-[11px] font-semibold", couponState.status === "valid" ? "text-emerald-600" : couponState.status === "invalid" ? "text-red-600" : "text-slate-500")}>{couponState.message}</p>}<textarea value={newOrder.notes} onChange={(event) => updateNewOrder("notes", event.target.value)} placeholder="Internal/customer order notes" rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-slate-900 focus:bg-white" /><label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={newOrder.send_confirmation} onChange={(event) => updateNewOrder("send_confirmation", event.target.checked)} /> Send order confirmation email</label></section>
                <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Order summary</p><h3 className="mt-1 text-sm font-bold">Review before creating</h3></div><span className="grid size-8 place-items-center rounded-xl bg-white/10"><Check className="size-4 text-emerald-400" /></span></div><div className="space-y-2 text-xs"><div className="flex justify-between text-slate-400"><span>Items subtotal</span><span className="font-semibold text-slate-200">{formatPrice(createOrderSubtotal)}</span></div>{couponState.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Coupon discount</span><span>-{formatPrice(couponState.discount)}</span></div>}<div className="flex justify-between text-slate-400"><span>Shipping & tax</span><span>Calculated securely</span></div></div><div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4"><span className="text-xs font-semibold text-slate-400">Estimated total</span><span className="text-lg font-extrabold">{formatPrice(Math.max(0, createOrderSubtotal - couponState.discount))}+</span></div></section>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-[11px] text-slate-400">Stock and totals are validated again when the order is submitted.</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setCreateOrderOpen(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" disabled={isCreatingOrder} className="flex h-10 items-center gap-1.5 rounded-xl bg-slate-950 px-5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50">{isCreatingOrder && <Loader2 className="size-3.5 animate-spin" />} Create Order</button></div></div>
          </form>
        </div>
      )}

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
                      <p className="text-slate-400">
                        {[
                          item.color ? `Color: ${item.color}` : null,
                          item.size ? `Size: ${item.size}` : null,
                          item.sku ? `SKU: ${item.sku}` : null,
                        ].filter(Boolean).join(" • ")}
                      </p>
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
                  <p className="text-slate-400 capitalize">{selectedOrder.paymentMethod?.replace('_', ' ')}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Ship To</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Payment Proof / Bank Transfer Receipt */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Receipt className="size-4 text-slate-700" /> Payment & Proof of Transfer
                  </h4>
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                    selectedOrder.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-slate-500">
                  Method: <strong className="text-slate-800 capitalize">{selectedOrder.paymentMethod?.replace('_', ' ')}</strong>
                </p>

                {selectedOrder.paymentReceiptUrl ? (
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
                    <div className="flex items-center gap-3">
                      {selectedOrder.paymentReceiptUrl.endsWith(".pdf") ? (
                        <div className="grid size-12 place-items-center rounded-xl bg-red-100 text-red-600 font-bold text-xs border border-red-200">
                          PDF
                        </div>
                      ) : (
                        <img
                          src={selectedOrder.paymentReceiptUrl}
                          alt="Transfer Slip"
                          className="size-12 rounded-xl object-cover border border-slate-200 shadow-2xs cursor-pointer hover:opacity-90"
                          onClick={() => setViewingReceipt(selectedOrder.paymentReceiptUrl)}
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Bank Transfer Receipt Attached</p>
                        <p className="text-[11px] text-slate-500">Uploaded by customer for verification</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(selectedOrder.paymentReceiptUrl)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <a
                        href={selectedOrder.paymentReceiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                      >
                        <ExternalLink className="size-3.5" /> Open
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl border border-dashed border-slate-200 p-3 text-center text-slate-400 text-xs">
                    No payment receipt uploaded by customer.
                  </div>
                )}
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
              {selectedOrder.fulfillmentStatus === "In Transit" && (
                <button
                  type="button"
                  onClick={handleMarkFulfilled}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-3.5" /> Mark Fulfilled
                </button>
              )}
              {selectedOrder.fulfillmentStatus !== "Cancelled" && selectedOrder.fulfillmentStatus !== "Fulfilled" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <X className="size-3.5" /> Cancel Order
                </button>
              )}
              {selectedOrder.paymentStatus === "Pending" && (
                <button
                  type="button"
                  onClick={handleMarkPaid}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 px-4 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  <Check className="size-3.5" /> Mark Paid
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
                onClick={handleResendEmail}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Mail className="size-3.5" /> Resend Email
              </button>
              <button
                type="button"
                onClick={handlePrintPackingSlip}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="size-3.5" /> Print Packing Slip
              </button>
              <button
                type="button"
                onClick={handleDownloadInvoice}
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

      {/* Receipt Lightbox Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Customer Payment Receipt</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewingReceipt}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="size-3.5" />
                  Open in New Window
                </a>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-slate-50 p-2">
              {viewingReceipt.endsWith(".pdf") ? (
                <iframe
                  src={viewingReceipt}
                  title="Receipt PDF"
                  className="h-[60vh] w-full rounded-lg border border-slate-200"
                />
              ) : (
                <img
                  src={viewingReceipt}
                  alt="Payment Receipt"
                  className="max-h-[65vh] w-auto rounded-lg object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AdminOrdersPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminOrdersPage;
