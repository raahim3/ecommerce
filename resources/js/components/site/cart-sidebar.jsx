import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
  ArrowRight,
  Check,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "./cart";

export function CartSidebar() {
  const navigate = (url) => router.visit(url);
  const {
    items,
    count,
    subtotal,
    discountAmount,
    shipping,
    total,
    appliedPromo,
    promoCode,
    setPromoCode,
    applyPromoCode,
    removePromoCode,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput("");
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      closeCart();
      navigate("/checkout");
    }, 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-60 transition-opacity duration-400",
        isCartOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0 delay-200",
      )}
      aria-hidden={!isCartOpen}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity duration-400",
          isCartOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:max-w-lg",
          isCartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-5 text-accent" strokeWidth={1.8} />
            <h2 className="text-lg font-bold tracking-tight">Shopping Bag</h2>
            <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {count}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="border-b border-border bg-muted/40 px-6 py-3">
          <div className="flex items-center justify-between text-xs font-medium">
            {freeShippingRemaining > 0 ? (
              <span>
                Add{" "}
                <strong className="text-foreground">
                  {formatPrice(freeShippingRemaining)}
                </strong>{" "}
                more to unlock <strong className="text-accent">Free Shipping</strong>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Sparkles className="size-3.5 text-accent" />
                You unlocked Free Standard Shipping!
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {freeShippingProgress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List / Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-muted/70 text-muted-foreground">
              <ShoppingBag className="size-9 stroke-[1.3]" />
            </div>
            <h3 className="mt-5 text-lg font-bold">Your bag is empty</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Explore our curated collections of minimal design essentials and premium goods.
            </p>
            <button
              type="button"
              onClick={() => {
                closeCart();
                navigate("/shop");
              }}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Start Shopping
              <ArrowRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-4 py-4.5 transition-colors"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {item.category ? (
                          <span className="eyebrow text-[10px] text-muted-foreground block mb-0.5">
                            {typeof item.category === "object" ? item.category?.name : item.category}
                          </span>
                        ) : null}
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </h4>
                        {item.selectedColor && (
                          <p className="text-[11px] text-muted-foreground">{item.selectedColor}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="grid size-7 place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-border bg-surface px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(item.price * item.qty)}
                        </span>
                        {item.qty > 1 && (
                          <span className="block text-[11px] text-muted-foreground">
                            {formatPrice(item.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Quick Promo Suggestion */}
            {!appliedPromo && (
              <div className="mt-2 rounded-xl border border-dashed border-border bg-surface p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Tip:</span> Use promo code{" "}
                <button
                  type="button"
                  onClick={() => applyPromoCode("ATELIER10")}
                  className="rounded bg-accent/10 px-1.5 py-0.5 font-mono font-bold text-accent hover:underline"
                >
                  ATELIER10
                </button>{" "}
                for 10% off your order!
              </div>
            )}
          </div>
        )}

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="border-t border-border bg-surface px-6 py-4 shadow-lg">
            {/* Promo Code Form */}
            <div className="mb-4">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-xl bg-accent/10 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-accent font-semibold">
                    <Tag className="size-3.5" />
                    <span>
                      {appliedPromo.code} ({appliedPromo.label})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (e.g. ATELIER10)"
                      className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 text-xs uppercase placeholder:normal-case placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-9 rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:bg-muted"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-accent font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-foreground">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                <span>Total</span>
                <span className="text-base">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.99] disabled:opacity-75"
            >
              {isCheckingOut ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Proceeding to Checkout...
                </span>
              ) : (
                <>
                  <span>Checkout</span>
                  <span>•</span>
                  <span>{formatPrice(total)}</span>
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Lock className="size-3" /> Secure Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <RotateCcw className="size-3" /> 30-Day Returns
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
