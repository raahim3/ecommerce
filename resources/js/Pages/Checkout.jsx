import { useState, useMemo, useEffect, useRef } from "react";
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
  Landmark,
  Upload,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/components/site/cart";
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { SiteLayout } from "@/layouts/site-layout";

export function CheckoutPage({ user, savedAddresses = [] }) {
  const { props } = usePage();
  const generalSettings = props?.app_settings?.general || {};
  const storeCountries = useMemo(() => {
    const raw = generalSettings?.storeCountries;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    return ["Pakistan"];
  }, [generalSettings?.storeCountries]);

  const paymentSettings = props?.app_settings?.payments || {
    stripeEnabled: true,
    paypalEnabled: true,
    codEnabled: true,
  };
  const checkoutSettings = props?.app_settings?.checkout || {};
  const expressShippingRate = Number(checkoutSettings.shippingRate ?? 15);
  const overnightShippingRate = Number(checkoutSettings.overnightShippingRate ?? 25);

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
    if (paymentSettings.bankTransferEnabled) {
      methods.push({ id: "bank_transfer", label: "Bank Transfer", icon: Landmark, description: "Direct bank or wire transfer with receipt upload" });
    }
    return methods;
  }, [paymentSettings]);

  const navigate = (href) => router.visit(href);
  const {
    items,
    subtotal,
    discountAmount,
    shipping,
    taxAmount,
    total,
    shippingMethod,
    setShippingMethod,
    shippingMethods,
    appliedPromo,
    promoCode,
    setPromoCode,
    applyPromoCode,
    removePromoCode,
    freeShippingThresholdEnabled,
    freeShippingThreshold,
    clearCart,
  } = useCart();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Completed
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => availablePaymentMethods[0]?.id || "card");

  useEffect(() => {
    if (shippingMethods.length > 0 && !shippingMethods.some((method) => method.code === selectedShippingMethod)) {
      setSelectedShippingMethod(shippingMethods[0].code);
      setShippingMethod(shippingMethods[0].code);
    }
  }, [shippingMethods, selectedShippingMethod, setShippingMethod]);

  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.some((m) => m.id === selectedPaymentMethod)) {
      setSelectedPaymentMethod(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [pendingPaypal, setPendingPaypal] = useState(null);
  const [paypalError, setPaypalError] = useState("");
  const [paymentElementError, setPaymentElementError] = useState("");
  const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(false);
  const paymentMountRef = useRef(null);
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const paymentElementRef = useRef(null);
  const paypalMountRef = useRef(null);
  const [saveAddressForNextTime, setSaveAddressForNextTime] = useState(true);

  // Bank Transfer receipt states
  const [receiptUrl, setReceiptUrl] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const receiptInputRef = useRef(null);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingReceipt(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
      const res = await fetch("/api/checkout/upload-receipt", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setReceiptUrl(data.url);
        toast.success("Receipt uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload receipt.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading receipt.");
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Only authenticated user data or a saved address should prefill checkout.
  const [formData, setFormData] = useState(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
    const nameParts = user?.name ? user.name.trim().split(/\s+/) : [];
    const initialCountry = storeCountries.length === 1
      ? storeCountries[0]
      : (defaultAddr?.country && storeCountries.includes(defaultAddr.country) ? defaultAddr.country : storeCountries[0] || "Pakistan");

    return {
      email: user?.email || "",
      firstName: defaultAddr?.first_name || nameParts[0] || "",
      lastName: defaultAddr?.last_name || nameParts.slice(1).join(" ") || "",
      address: defaultAddr?.address_line1 || "",
      apartment: defaultAddr?.address_line2 || "",
      city: defaultAddr?.city || "",
      state: defaultAddr?.state || "",
      zipCode: defaultAddr?.postal_code || "",
      country: initialCountry,
      phone: defaultAddr?.phone || "",
      cardNumber: "",
      cardExp: "",
      cardCvc: "",
      cardName: user?.name || "",
    };
  });

  const [availableStates, setAvailableStates] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);

  // Synchronize country if storeCountries has only 1 country or changes
  useEffect(() => {
    if (storeCountries.length === 1) {
      if (formData.country !== storeCountries[0]) {
        setFormData((prev) => ({ ...prev, country: storeCountries[0] }));
      }
    } else if (storeCountries.length > 1) {
      if (!formData.country || !storeCountries.includes(formData.country)) {
        setFormData((prev) => ({ ...prev, country: storeCountries[0] }));
      }
    }
  }, [storeCountries]);

  // Load states whenever selected country changes
  useEffect(() => {
    const activeCountry = formData.country || (storeCountries.length === 1 ? storeCountries[0] : "");
    if (!activeCountry) {
      setAvailableStates([]);
      return;
    }

    let isMounted = true;
    setIsLoadingStates(true);

    fetch(`/api/countries/${encodeURIComponent(activeCountry)}/states`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setAvailableStates(data);
          setFormData((prev) => {
            const current = (prev.state || "").trim().toLowerCase();
            const match = data.find((s) => s.name.trim().toLowerCase() === current);
            return {
              ...prev,
              state: match ? match.name : (prev.state || data[0].name),
            };
          });
        } else {
          setAvailableStates([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch states for", activeCountry, err);
        if (isMounted) setAvailableStates([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.country, storeCountries]);

  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Load cities whenever selected state changes
  useEffect(() => {
    if (!formData.state) {
      setAvailableCities([]);
      return;
    }

    let isMounted = true;
    setIsLoadingCities(true);

    const countryParam = formData.country ? `?country=${encodeURIComponent(formData.country)}` : "";
    fetch(`/api/states/${encodeURIComponent(formData.state)}/cities${countryParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setAvailableCities(data);
          setFormData((prev) => {
            const currentCity = (prev.city || "").trim().toLowerCase();
            const match = data.find((c) => c.name.trim().toLowerCase() === currentCity);
            return {
              ...prev,
              city: match ? match.name : (prev.city || data[0].name),
            };
          });
        } else {
          setAvailableCities([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch cities for", formData.state, err);
        if (isMounted) setAvailableCities([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [formData.state, formData.country]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectSavedAddress = (addr) => {
    const resolvedCountry = storeCountries.length === 1
      ? storeCountries[0]
      : (addr.country && storeCountries.includes(addr.country) ? addr.country : (formData.country || storeCountries[0]));

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
      country: resolvedCountry,
    }));
    toast.info("Saved address selected");
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.address || !formData.country) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!pendingPayment?.clientSecret || !paymentMountRef.current) return undefined;

    let cancelled = false;
    const mountPaymentElement = async () => {
      setIsPaymentElementLoading(true);
      setPaymentElementError("");
      if (!paymentSettings.stripePublishable) {
        setPaymentElementError("Stripe publishable key is missing. Add it in Admin > Payment Gateways.");
        setIsPaymentElementLoading(false);
        return;
      }

      try {
        const stripe = await loadStripe(paymentSettings.stripePublishable);
        if (cancelled || !stripe || !paymentMountRef.current) {
          if (!cancelled && !stripe) {
            setPaymentElementError("Stripe could not load. Check that the publishable key starts with pk_test_ or pk_live_.");
            setIsPaymentElementLoading(false);
          }
          return;
        }

        const elements = stripe.elements({ clientSecret: pendingPayment.clientSecret });
        const paymentElement = elements.create("payment");
        paymentElement.on("ready", () => {
          if (!cancelled) setIsPaymentElementLoading(false);
        });
        paymentElement.on("loaderror", (event) => {
          if (!cancelled) {
            setPaymentElementError(event.error?.message || "Stripe could not load the payment form.");
            setIsPaymentElementLoading(false);
          }
        });
        paymentElement.mount(paymentMountRef.current);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        paymentElementRef.current = paymentElement;
      } catch (error) {
        if (!cancelled) {
          setPaymentElementError(error.message || "Stripe could not initialize.");
          setIsPaymentElementLoading(false);
        }
      }
    };

    mountPaymentElement();
    return () => {
      cancelled = true;
      paymentElementRef.current?.destroy();
      paymentElementRef.current = null;
      stripeRef.current = null;
      elementsRef.current = null;
    };
  }, [pendingPayment, paymentSettings.stripePublishable]);

  useEffect(() => {
    if (!pendingPaypal?.paypalOrderId || !paypalMountRef.current) return undefined;

    let cancelled = false;
    const renderPayPal = async () => {
      setPaypalError("");
      if (!paymentSettings.paypalClientId) {
        setPaypalError("PayPal is not configured. Add the client ID in the server environment.");
        return;
      }

      try {
        if (!window.paypal) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paymentSettings.paypalClientId)}&currency=${encodeURIComponent(pendingPaypal.currency)}`;
            script.onload = resolve;
            script.onerror = () => reject(new Error("PayPal could not load."));
            document.body.appendChild(script);
          });
        }
        if (cancelled || !window.paypal || !paypalMountRef.current) return;

        window.paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "paypal" },
          createOrder: () => pendingPaypal.paypalOrderId,
          onApprove: async (details) => {
            setIsProcessing(true);
            try {
              const response = await fetch("/api/payment/paypal/capture-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                  order_number: pendingPaypal.orderNumber,
                  paypal_order_id: details.orderID,
                }),
              });
              const data = await response.json();
              if (!response.ok || !data.success) throw new Error(data.message || "PayPal payment could not be confirmed.");
              completeOrder(pendingPaypal.checkoutData);
              setPendingPaypal(null);
            } catch (error) {
              setPaypalError(error.message || "PayPal payment could not be confirmed.");
            } finally {
              setIsProcessing(false);
            }
          },
          onCancel: () => setPaypalError("PayPal checkout was cancelled. You can try again."),
          onError: (error) => setPaypalError(error?.message || "PayPal checkout failed. Please try again."),
        }).render(paypalMountRef.current);
      } catch (error) {
        if (!cancelled) setPaypalError(error.message || "PayPal could not initialize.");
      }
    };

    renderPayPal();
    return () => {
      cancelled = true;
      if (paypalMountRef.current) paypalMountRef.current.replaceChildren();
    };
  }, [pendingPaypal, paymentSettings.paypalClientId]);

  const completeOrder = (data) => {
    const activeShipping = shippingMethods.find((m) => m.code === (shippingMethod || selectedShippingMethod));
    const deliveryDaysText = activeShipping
      ? (activeShipping.delivery_min_days === activeShipping.delivery_max_days
          ? `${activeShipping.delivery_min_days} business day`
          : `${activeShipping.delivery_min_days}–${activeShipping.delivery_max_days} business days`)
      : "3–5 business days";

    const resolvedOrderNumber = data.order_number || data.order?.order_number;

    const orderRecord = {
      id: resolvedOrderNumber,
      order_number: resolvedOrderNumber,
      trackingToken: data.tracking_token,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      items: [...items],
      total: Number(data.order?.total_amount ?? total),
      status: selectedPaymentMethod === "bank_transfer" ? "Payment Verification" : "Processing",
      paymentMethod: selectedPaymentMethod,
      paymentReceiptUrl: receiptUrl || null,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      trackingNumber: data.order?.tracking_number || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: `In ${deliveryDaysText}`,
    };

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
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    setIsProcessing(true);

    try {
      if (pendingPayment) {
        if (!stripeRef.current || !elementsRef.current) {
          throw new Error("Payment form is still loading. Please try again.");
        }

        const { error, paymentIntent } = await stripeRef.current.confirmPayment({
          elements: elementsRef.current,
          redirect: "if_required",
        });
        if (error) throw new Error(error.message);
        if (paymentIntent?.status !== "succeeded") throw new Error("Payment was not completed.");

        const confirmRes = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
          body: JSON.stringify({
            order_number: pendingPayment.orderNumber,
            payment_intent_id: paymentIntent.id,
          }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.success) throw new Error(confirmData.message || "Payment confirmation failed.");

        completeOrder(pendingPayment.checkoutData);
        setPendingPayment(null);
        return;
      }

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
        payment_receipt_url: selectedPaymentMethod === "bank_transfer" ? receiptUrl || null : null,
        shipping_method: shippingMethod,
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
        if (selectedPaymentMethod === "card") {
          const intentRes = await fetch("/api/payment/intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
              "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
            },
            body: JSON.stringify({ order_number: data.order_number }),
          });
          const intentData = await intentRes.json();
          if (!intentRes.ok || !intentData.clientSecret) throw new Error(intentData.message || "Could not initialize Stripe payment.");
          setPendingPayment({ checkoutData: data, orderNumber: data.order_number, clientSecret: intentData.clientSecret });
          toast.info("Enter your card details to complete payment.");
          return;
        }

        if (selectedPaymentMethod === "paypal") {
          const paypalRes = await fetch("/api/payment/paypal/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
              "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
            },
            body: JSON.stringify({ order_number: data.order_number }),
          });
          const paypalData = await paypalRes.json();
          if (!paypalRes.ok || !paypalData.paypalOrderId) throw new Error(paypalData.message || "Could not initialize PayPal payment.");
          setPendingPaypal({
            checkoutData: data,
            orderNumber: data.order_number,
            paypalOrderId: paypalData.paypalOrderId,
            currency: paypalData.currency || "USD",
          });
          toast.info("Complete your payment securely with PayPal.");
          return;
        }

        completeOrder(data);
      } else {
        toast.error("Checkout Error", {
          description: data.message || "Failed to process order. Please verify your details.",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Checkout unavailable", {
        description: "Your order was not created. Please check your connection and try again.",
      });
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
              <span className="font-mono font-bold text-foreground">#{completedOrder.order_number || completedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span className="font-semibold text-foreground">{completedOrder.estimatedDelivery || "In 3–5 business days"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping To:</span>
              <span className="font-semibold text-foreground">{completedOrder.shippingAddress}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground font-bold">Total Amount:</span>
              <span className="font-extrabold text-foreground">{formatPrice(completedOrder.total)}</span>
            </div>
          </div>

          {completedOrder.paymentMethod === "bank_transfer" && (
            <div className="mt-6 rounded-2xl bg-amber-50/70 border border-amber-200 p-5 text-left text-xs text-amber-900 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Landmark className="size-4 text-amber-700" />
                <span>Direct Bank Transfer Details</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Please transfer <strong>{formatPrice(completedOrder.total)}</strong> to our bank account quoting order reference <strong>#{completedOrder.order_number || completedOrder.id}</strong>.
              </p>
              {paymentSettings.bankAccountNumber && (
                <div className="rounded-xl bg-white/80 border border-amber-200/80 p-3 text-[11px] font-mono text-amber-950 space-y-1">
                  {paymentSettings.bankName && <p><strong>Bank:</strong> {paymentSettings.bankName}</p>}
                  {paymentSettings.bankAccountTitle && <p><strong>Title:</strong> {paymentSettings.bankAccountTitle}</p>}
                  <p><strong>Account / IBAN:</strong> {paymentSettings.bankAccountNumber}</p>
                  {paymentSettings.bankSwift && <p><strong>SWIFT:</strong> {paymentSettings.bankSwift}</p>}
                </div>
              )}
              {completedOrder.paymentReceiptUrl ? (
                <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" /> Payment receipt attached. Our accounts team will verify and dispatch your items.
                </p>
              ) : (
                <p className="text-amber-800 text-[11px] pt-1">
                  💡 Once transfer is completed, you can view this order on the tracking page to check verification status.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/order-tracking?order=${completedOrder.id}&email=${encodeURIComponent(formData.email)}`}
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

                  {storeCountries.length > 1 && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Country / Region
                      </label>
                      <select
                        required
                        value={formData.country}
                        onChange={(e) => {
                          const newCountry = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            country: newCountry,
                            state: "",
                          }));
                        }}
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                      >
                        <option value="">Select country</option>
                        {storeCountries.map((cName) => (
                          <option key={cName} value={cName}>
                            {cName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>State / Province</span>
                        {isLoadingStates && (
                          <span className="text-[10px] text-muted-foreground animate-pulse font-normal">Loading...</span>
                        )}
                      </label>
                      {availableStates.length > 0 ? (
                        <select
                          required
                          value={formData.state}
                          onChange={(e) => {
                            const newState = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              state: newState,
                              city: "",
                            }));
                          }}
                          disabled={isLoadingStates}
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
                        >
                          <option value="">Select State</option>
                          {availableStates.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      ) : isLoadingStates ? (
                        <select
                          disabled
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground focus:outline-none"
                        >
                          <option>Loading states...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          placeholder="State / Province"
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>City</span>
                        {isLoadingCities && (
                          <span className="text-[10px] text-muted-foreground animate-pulse font-normal">Loading...</span>
                        )}
                      </label>
                      {availableCities.length > 0 ? (
                        <select
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={isLoadingCities}
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none disabled:opacity-60"
                        >
                          <option value="">Select City</option>
                          {availableCities.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : isLoadingCities ? (
                        <select
                          disabled
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground focus:outline-none"
                        >
                          <option>Loading cities...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="City"
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                        />
                      )}
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
                        placeholder="ZIP code"
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
                  {shippingMethods.map((m) => (
                    <label
                      key={m.code}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all",
                        selectedShippingMethod === m.code
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-foreground/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_speed"
                          checked={selectedShippingMethod === m.code}
                          onChange={() => {
                            setSelectedShippingMethod(m.code);
                            setShippingMethod(m.code);
                          }}
                          className="size-4 accent-accent"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.delivery_min_days === m.delivery_max_days ? `${m.delivery_min_days} business day` : `${m.delivery_min_days}–${m.delivery_max_days} business days`}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-foreground">{m.pricing_type === "free_threshold" && freeShippingThresholdEnabled && Number(subtotal) >= Number(m.free_shipping_min ?? freeShippingThreshold) ? "FREE" : formatPrice(Number(m.price || 0))}</span>
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
                      <div className="rounded-xl border border-border bg-background p-3.5">
                        <div ref={paymentMountRef}>
                          {!pendingPayment && (
                            <p className="py-3 text-xs text-muted-foreground">
                              Click “Continue to Secure Payment” to load Stripe’s secure card form.
                            </p>
                          )}
                        </div>
                        {pendingPayment && isPaymentElementLoading && (
                          <p className="py-3 text-xs text-muted-foreground">Loading secure payment form...</p>
                        )}
                        {paymentElementError && (
                          <p className="py-3 text-xs font-semibold text-destructive">{paymentElementError}</p>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Your card details are securely handled by Stripe and never stored on this site.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === "paypal" && (
                    <div className="rounded-2xl bg-muted/40 p-5 text-center text-xs text-muted-foreground border border-border/80 space-y-1">
                      <ShoppingBag className="size-6 mx-auto text-blue-600 mb-1" />
                      <p className="font-bold text-foreground">PayPal Express Checkout</p>
                      {!pendingPaypal && <p>Continue below to securely authorize your payment with PayPal.</p>}
                      {pendingPaypal && <div ref={paypalMountRef} className="mx-auto mt-4 max-w-sm text-left" />}
                      {paypalError && <p className="pt-2 font-semibold text-destructive">{paypalError}</p>}
                    </div>
                  )}

                  {selectedPaymentMethod === "cod" && (
                    <div className="rounded-2xl bg-emerald-50/50 p-5 text-center text-xs text-emerald-900 border border-emerald-200/80 space-y-1">
                      <Truck className="size-6 mx-auto text-emerald-600 mb-1" />
                      <p className="font-bold text-emerald-950">Cash on Delivery (COD)</p>
                      <p className="text-emerald-700">Pay <strong>{formatPrice(total)}</strong> in cash when the delivery courier delivers your package.</p>
                    </div>
                  )}

                  {selectedPaymentMethod === "bank_transfer" && (
                    <div className="rounded-2xl bg-surface border border-border p-5 text-xs text-foreground space-y-4 animate-in fade-in">
                      <div className="flex items-center gap-2.5 border-b border-border/70 pb-3">
                        <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Landmark className="size-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">Direct Bank Transfer</p>
                          <p className="text-[11px] text-muted-foreground">Make payment directly into our bank account</p>
                        </div>
                      </div>

                      {/* Bank Details Card */}
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {paymentSettings.bankName && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bank Name</span>
                              <p className="font-bold text-foreground text-xs mt-0.5">{paymentSettings.bankName}</p>
                            </div>
                          )}
                          {paymentSettings.bankAccountTitle && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Title</span>
                              <p className="font-bold text-foreground text-xs mt-0.5">{paymentSettings.bankAccountTitle}</p>
                            </div>
                          )}
                          {paymentSettings.bankAccountNumber && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account Number / IBAN</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="font-mono font-bold text-foreground text-xs">{paymentSettings.bankAccountNumber}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(paymentSettings.bankAccountNumber);
                                    setCopiedIban(true);
                                    toast.success("Account number copied to clipboard!");
                                    setTimeout(() => setCopiedIban(false), 2500);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  {copiedIban ? <Check className="size-2.5 text-emerald-600" /> : <Copy className="size-2.5" />}
                                  <span>{copiedIban ? "Copied" : "Copy"}</span>
                                </button>
                              </div>
                            </div>
                          )}
                          {paymentSettings.bankSwift && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SWIFT / Branch Code</span>
                              <p className="font-mono font-bold text-foreground text-xs mt-0.5">{paymentSettings.bankSwift}</p>
                            </div>
                          )}
                        </div>

                        {paymentSettings.bankInstructions && (
                          <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">Instructions: </strong>
                            {paymentSettings.bankInstructions}
                          </div>
                        )}
                      </div>

                      {/* Payment Proof / Receipt Upload */}
                      <div className="rounded-xl border border-dashed border-border bg-surface p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <Upload className="size-3.5 text-primary" />
                            <span>Upload Payment Receipt / Transfer Slip</span>
                          </label>
                          <span className="text-[10px] text-muted-foreground">Optional now, or submit later</span>
                        </div>

                        <input
                          ref={receiptInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />

                        {receiptUrl ? (
                          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-emerald-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">Receipt Attached</span>
                              <a
                                href={receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-emerald-700 font-bold hover:text-emerald-900 ml-1"
                              >
                                Preview
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReceiptUrl("")}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => receiptInputRef.current?.click()}
                            className="flex flex-col items-center justify-center rounded-lg border border-border/70 bg-muted/20 py-4 px-3 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <Upload className="size-5 text-muted-foreground mb-1" />
                            <p className="text-xs font-semibold text-foreground">
                              {isUploadingReceipt ? "Uploading receipt..." : "Click to select payment screenshot or PDF"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              JPG, PNG, WEBP, or PDF (Max 15MB)
                            </p>
                          </div>
                        )}
                      </div>
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
                    disabled={isProcessing || Boolean(pendingPaypal)}
                    className="flex-1 h-13 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Lock className="size-4" />
                    {isProcessing
                      ? "Processing Payment..."
                      : pendingPayment
                        ? `Pay ${formatPrice(total)}`
                        : pendingPaypal
                          ? "Pay with PayPal above"
                        : selectedPaymentMethod === "bank_transfer"
                          ? "Place Order via Bank Transfer"
                        : `Continue to Secure Payment`}
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
                      {[
                        `Qty: ${item.qty}`,
                        item.selectedColor,
                        item.selectedSize ? `Size: ${item.selectedSize}` : null,
                      ].filter(Boolean).join(" • ")}
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
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span className="font-semibold text-foreground">{formatPrice(taxAmount)}</span>
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
