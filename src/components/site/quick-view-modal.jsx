import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, X, ShoppingBag, Check, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "./cart";

export function QuickViewModal({ product, isOpen, onClose }) {
  const { addItem, wishlist, toggleWish } = useCart();
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImgIdx(0);
      setSelectedColor(0);
      setSelectedSize(0);
      setQuantity(1);
      setIsAdding(false);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const wished = wishlist.includes(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image, product.hover];
  const activeImage = images[selectedImgIdx] || product.image;

  const handleAddToCart = () => {
    setIsAdding(true);
    const chosenColor = product.colors && product.colors[selectedColor] ? product.colors[selectedColor].name : undefined;
    const chosenSize = product.sizes && product.sizes[selectedSize] ? product.sizes[selectedSize] : undefined;

    addItem(
      {
        ...product,
        selectedColor: chosenColor,
        selectedSize: chosenSize,
      },
      quantity,
      true, // open cart drawer
    );

    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 400);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-border/80 shadow-2xl transition-all duration-300 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-surface/90 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          <X className="size-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted">
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-500"
              />
              {product.badge && (
                <span
                  className={cn(
                    "absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase shadow-sm",
                    product.badge === "Sale"
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface/90 text-foreground",
                  )}
                >
                  {product.badge}
                </span>
              )}
              <button
                type="button"
                onClick={() => toggleWish(product)}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="glass absolute top-3 right-3 grid size-9 place-items-center rounded-full transition-all duration-300"
              >
                <Heart
                  className={cn(
                    "size-4 transition-colors",
                    wished ? "fill-accent text-accent" : "text-foreground",
                  )}
                />
              </button>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      selectedImgIdx === idx
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="eyebrow">{product.category}</span>
                {product.sku && <span className="font-mono text-[11px]">SKU: {product.sku}</span>}
              </div>

              {/* Title */}
              <h2 id="quick-view-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 text-accent">
                  <Star className="size-4 fill-accent" />
                  <span className="font-semibold text-foreground">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviews} customer reviews</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.compareAt && (
                  <>
                    <span className="text-lg font-medium text-subtle line-through">
                      {formatPrice(product.compareAt)}
                    </span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                      Save {formatPrice(product.compareAt - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {product.description || product.tagline}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Color: <span className="text-foreground">{product.colors[selectedColor]?.name}</span>
                  </label>
                  <div className="mt-2 flex gap-2.5">
                    {product.colors.map((c, idx) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(idx);
                          if (c.image && images.includes(c.image)) {
                            setSelectedImgIdx(images.indexOf(c.image));
                          }
                        }}
                        title={c.name}
                        className={cn(
                          "relative grid size-8 place-items-center rounded-full transition-all",
                          selectedColor === idx
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100",
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {selectedColor === idx && (
                          <Check className={cn("size-3.5", c.hex === "#fafafa" || c.hex === "#eae4d9" || c.hex === "#ede8df" ? "text-ink" : "text-white")} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 1 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Size: <span className="text-foreground">{product.sizes[selectedSize]}</span>
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s, idx) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(idx)}
                        className={cn(
                          "min-w-11 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                          selectedSize === idx
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border text-foreground hover:border-foreground/30 bg-surface",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Stock */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-border bg-surface p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="grid size-8 place-items-center rounded-full text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="grid size-8 place-items-center rounded-full text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock • Ready to ship</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 space-y-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-accent/25 active:scale-[0.99]"
              >
                <ShoppingBag className="size-4" />
                {isAdding ? "Adding..." : `Add to Bag • ${formatPrice(product.price * quantity)}`}
              </button>

              <div className="flex items-center justify-between pt-1">
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="group flex items-center gap-1.5 text-xs font-bold text-foreground transition-colors hover:text-accent"
                >
                  <span>View Full Product Details</span>
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="size-3 text-accent" /> Free shipping $100+
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3 text-accent" /> 2-Yr Warranty
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
