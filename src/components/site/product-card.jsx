import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "./cart";

export function ProductCard({ product, layout = "grid", onQuickView, className }) {
  const { addItem, wishlist, toggleWish } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const wished = wishlist.includes(product.id);

  if (layout === "list") {
    return (
      <article
        className={cn(
          "group relative flex flex-col sm:flex-row gap-5 rounded-2xl border border-border/70 bg-surface p-4 transition-all duration-300 hover:border-foreground/30 hover:shadow-soft",
          className,
        )}
      >
        {/* Image */}
        <div className="relative aspect-4/5 w-full sm:w-48 sm:shrink-0 overflow-hidden rounded-xl bg-muted">
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            <img
              src={product.image}
              alt={product.alt || product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          {product.badge && (
            <span
              className={cn(
                "absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase shadow-xs",
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
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            className={cn(
              "glass absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full transition-all duration-300",
              wished ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <Heart
              className={cn("size-3.5", wished ? "fill-accent text-accent" : "text-foreground")}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow">{product.category}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>
            </div>

            <Link
              to={`/product/${product.id}`}
              className="mt-1.5 block text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
            >
              {product.name}
            </Link>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {product.tagline || product.description}
            </p>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  {product.colors.length} Colors:
                </span>
                <div className="flex gap-1">
                  {product.colors.map((c) => (
                    <span
                      key={c.name}
                      title={c.name}
                      className="size-3 rounded-full border border-border/80"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-border/60">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compareAt && (
                <span className="text-xs font-medium text-subtle line-through">
                  {formatPrice(product.compareAt)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onQuickView && (
                <button
                  type="button"
                  onClick={() => onQuickView(product)}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:border-foreground/40"
                >
                  <Eye className="size-3.5" />
                  <span>Quick View</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => addItem(product)}
                className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingBag className="size-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link to={`/product/${product.id}`} className="block relative aspect-4/5 w-full">
          <img
            src={product.image}
            alt={product.alt || product.name}
            width={900}
            height={1100}
            loading="lazy"
            className="aspect-4/5 w-full object-cover transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-0"
          />
          <img
            src={product.hover || product.image}
            alt=""
            aria-hidden="true"
            width={900}
            height={1100}
            loading="lazy"
            className="absolute inset-0 aspect-4/5 w-full scale-[1.04] object-cover opacity-0 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        </Link>

        {product.badge ? (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase shadow-xs pointer-events-none",
              product.badge === "Sale"
                ? "bg-accent text-accent-foreground"
                : "bg-surface/90 text-foreground",
            )}
          >
            {product.badge}
          </span>
        ) : null}

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWish(product)}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            aria-pressed={wished}
            className={cn(
              "glass grid size-9 place-items-center rounded-full transition-all duration-300 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
              wished && "opacity-100",
            )}
          >
            <Heart
              className={cn("size-4", wished ? "fill-accent text-accent" : "text-foreground")}
              strokeWidth={1.7}
            />
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Quick preview ${product.name}`}
              className="glass grid size-9 place-items-center rounded-full transition-all duration-300 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-105"
            >
              <Eye className="size-4 text-foreground" strokeWidth={1.7} />
            </button>
          )}
        </div>

        {/* Hover Bottom Add To Cart button */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:scale-[0.99]"
          >
            Add to Bag
          </button>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-1">
        <p className="eyebrow">{product.category}</p>
        <Link
          to={`/product/${product.id}`}
          className="truncate text-[15px] font-semibold text-foreground transition-colors hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-accent text-accent" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
        <p className="mt-1 flex items-baseline gap-2 text-[15px] font-bold">
          {formatPrice(product.price)}
          {product.compareAt ? (
            <span className="text-sm font-medium text-subtle line-through">
              {formatPrice(product.compareAt)}
            </span>
          ) : null}
        </p>

        {/* Color Swatch Dots if present */}
        {product.colors && product.colors.length > 1 && (
          <div className="mt-1 flex items-center gap-1">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="size-2 rounded-full border border-border/80"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => addItem(product)}
        className="mt-2 h-10 rounded-full border border-border text-xs font-semibold tracking-wide transition-colors duration-300 hover:border-foreground/40 md:hidden"
      >
        Add to Bag
      </button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-4/5 w-full rounded-2xl bg-muted" />
      <div className="mt-3 h-3 w-16 rounded bg-muted" />
      <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
    </div>
  );
}
