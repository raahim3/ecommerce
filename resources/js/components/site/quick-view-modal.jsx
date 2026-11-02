import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Heart, Star, X, ShoppingBag, Check, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { replaceStoreNameInContent } from "@/lib/store-branding";
import { formatPrice } from "@/lib/shop-data";
import { productImageSrcSet } from "@/lib/product-images";
import { useCart } from "./cart";

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
};

export function QuickViewModal({ product: productData, isOpen, onClose }) {
  const storeName = usePage().props?.app_settings?.general?.storeName || "Store";
  const product = replaceStoreNameInContent(productData, storeName);
  const { addItem, items: cartItems, openCart, wishlist, toggleWish } = useCart();
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [sizeQuantities, setSizeQuantities] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImgIdx(0);
      setSelectedColor(0);
      setSizeQuantities({});
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
  const subcategoryName = typeof product.subcategory === "object" ? product.subcategory?.name : (product.subcategory || "");
  const categoryName = subcategoryName || (typeof product.category === "object" ? product.category?.name : (product.category || "Collection"));
  const loadedReviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewsCount = loadedReviews.length > 0
    ? loadedReviews.length
    : (Number(product.reviews_count ?? 0) || 0);
  const averageRating = loadedReviews.length > 0
    ? loadedReviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / loadedReviews.length
    : (Number(product.rating) > 0 ? Number(product.rating) : 0);
  const variantColors = product.variants?.map((variant) => ({
    name: variant.color_name,
    hex: variant.color_hex,
    image: variant.image_url,
  })) || [];
  const productColors = product.colors?.length
    ? product.colors
    : (product.available_colors?.length ? product.available_colors : variantColors);
  const productSizes = [...new Set([
    ...(product.sizes || []),
    ...(product.available_sizes || []),
    ...(product.variants?.map((variant) => variant.size).filter(Boolean) || []),
  ])];
  const chosenColorValue = productColors[selectedColor];
  const chosenColorName = typeof chosenColorValue === "string" ? chosenColorValue : chosenColorValue?.name;
  const availableStock = Number(product.stock_quantity ?? product.stockCount ?? 0);
  const cartProductQuantity = cartItems
    .filter((item) => Number(item.id) === Number(product.id))
    .reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const getVariantForSize = (size) => {
    const matches = (product.variants || []).filter((variant) => variant.size === size);
    return matches.find((variant) => variant.color_name === chosenColorName)
      || matches.find((variant) => !variant.color_name)
      || (matches.length === 1 ? matches[0] : null);
  };
  const getMaxSizeQuantity = (size) => {
    const selectedTotal = productSizes.reduce((sum, value) => sum + (Number(sizeQuantities[value]) || 0), 0);
    const currentQuantity = Number(sizeQuantities[size]) || 0;
    const variant = getVariantForSize(size);
    const sizeVariants = (product.variants || []).filter((entry) => entry.size === size);
    if (sizeVariants.length > 0 && !variant) return 0;
    const cartVariantQuantity = variant
      ? cartItems.filter((item) => Number(item.variant_id) === Number(variant.id)).reduce((sum, item) => sum + Number(item.qty || 0), 0)
      : 0;
    const productRemaining = Math.max(0, availableStock - cartProductQuantity);
    const variantRemaining = variant ? Math.max(0, Number(variant.stock_quantity || 0) - cartVariantQuantity) : productRemaining;
    return Math.max(0, Math.min(
      productRemaining,
      variantRemaining,
      availableStock - cartProductQuantity - (selectedTotal - currentQuantity),
    ));
  };
  const selectedSizeTotal = productSizes.reduce((sum, size) => sum + (Number(sizeQuantities[size]) || 0), 0);
  const selectedAmount = productSizes.length
    ? productSizes.reduce((sum, size) => {
      const variant = getVariantForSize(size);
      return sum + (Number(product.price) + Number(variant?.additional_price || 0)) * (Number(sizeQuantities[size]) || 0);
    }, 0)
    : Number(product.price) * quantity;
  const compareAt = Number(product.compareAt || product.compare_at_price || 0);
  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image, product.hover];
  const images = rawImages.map(img => typeof img === "object" ? img.image_url : img).filter(Boolean);
  const activeImage = images[selectedImgIdx] || images[0] || "/resources/js/assets/p-headphones.jpg";

  const handleAddToCart = async () => {
    setIsAdding(true);
    const selections = productSizes.length
      ? productSizes.filter((size) => Number(sizeQuantities[size]) > 0).map((size) => {
        const variant = getVariantForSize(size);
        return {
          product: {
            ...product,
            selectedColor: chosenColorName,
            selectedSize: size,
            variant_id: variant?.id || null,
            additional_price: variant?.additional_price || 0,
          },
          quantity: Number(sizeQuantities[size]),
        };
      })
      : [{
        product: { ...product, selectedColor: chosenColorName, selectedSize: null },
        quantity,
      }];

    if (productSizes.length && selections.length === 0) {
      toast.error("Choose a quantity for at least one curtain size.");
      setIsAdding(false);
      return;
    }

    for (const selection of selections) {
      const added = await addItem(selection.product, selection.quantity, false, false);
      if (!added) {
        setIsAdding(false);
        openCart();
        return;
      }
    }

    setIsAdding(false);
    toast.success("Selected curtain sizes added to your bag.");
    openCart();
    onClose();
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
                srcSet={productImageSrcSet(activeImage)}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={product.name}
                width={800}
                height={1000}
                decoding="async"
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
                    <img
                      src={img}
                      srcSet={productImageSrcSet(img)}
                      sizes="4rem"
                      alt=""
                      width={256}
                      height={256}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
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
                <span className="eyebrow">{categoryName}</span>
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
                  <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{reviewsCount} customer reviews</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {compareAt > Number(product.price) && (
                  <>
                    <span className="text-lg font-medium text-subtle line-through">
                      {formatPrice(compareAt)}
                    </span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                      Save {formatPrice(compareAt - product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {product.tagline || stripHtml(product.description)}
              </p>

              {/* Color Selector */}
              {productColors.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Color: <span className="text-foreground">{productColors[selectedColor]?.name || productColors[selectedColor]}</span>
                  </label>
                  <div className="mt-2 flex gap-2.5">
                    {productColors.map((color, idx) => {
                      const normalizedColor = typeof color === "string" ? { name: color } : color;
                      return (
                        <button
                          key={normalizedColor.name || idx}
                          type="button"
                          onClick={() => {
                            setSelectedColor(idx);
                            if (normalizedColor.image && images.includes(normalizedColor.image)) {
                              setSelectedImgIdx(images.indexOf(normalizedColor.image));
                            }
                          }}
                          title={normalizedColor.name}
                          className={cn(
                            "relative grid size-8 place-items-center rounded-full transition-all",
                            selectedColor === idx
                              ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface scale-110"
                              : "hover:scale-105 opacity-80 hover:opacity-100",
                          )}
                          style={{ backgroundColor: normalizedColor.hex }}
                        >
                          {selectedColor === idx && (
                            <Check className={cn("size-3.5", ["#fafafa", "#eae4d9", "#ede8df"].includes(normalizedColor.hex) ? "text-ink" : "text-white")} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {productSizes.length > 0 && (
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Choose quantity by size
                  </label>
                  <div className="mt-2 divide-y divide-border rounded-xl border border-border px-3">
                    {productSizes.map((size) => {
                      const count = Number(sizeQuantities[size]) || 0;
                      const max = getMaxSizeQuantity(size);
                      return (
                        <div key={size} className="flex items-center justify-between gap-3 py-2">
                          <div>
                            <p className="text-xs font-semibold">{size}</p>
                            <p className="text-[10px] text-muted-foreground">{max > 0 ? `${max} available` : "Out of stock"}</p>
                          </div>
                          <div className="flex items-center rounded-full border border-border p-0.5">
                            <button type="button" aria-label={`Decrease ${size} quantity`} disabled={count <= 0} onClick={() => setSizeQuantities((current) => ({ ...current, [size]: Math.max(0, count - 1) }))} className="grid size-7 place-items-center rounded-full hover:bg-muted disabled:opacity-30">-</button>
                            <span className="w-7 text-center text-xs font-bold">{count}</span>
                            <button type="button" aria-label={`Increase ${size} quantity`} disabled={count >= max} onClick={() => setSizeQuantities((current) => ({ ...current, [size]: Math.min(max, count + 1) }))} className="grid size-7 place-items-center rounded-full hover:bg-muted disabled:opacity-30">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{selectedSizeTotal} curtain(s) selected</p>
                </div>
              )}

              {/* Quantity Stepper & Stock */}
              {!productSizes.length && (
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
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 space-y-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || availableStock <= 0 || (productSizes.length > 0 && (selectedSizeTotal === 0 || productSizes.some((size) => (Number(sizeQuantities[size]) || 0) > getMaxSizeQuantity(size))))}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-accent/25 active:scale-[0.99]"
              >
                <ShoppingBag className="size-4" />
                {isAdding ? "Adding..." : `Add to Bag • ${formatPrice(selectedAmount)}`}
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
                    <Truck className="size-3 text-accent" /> Free shipping {formatPrice(100)}+
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
