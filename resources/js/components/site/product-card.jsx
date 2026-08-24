import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Heart, Star, Eye, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";
import { useCart } from "./cart";

export function ProductCard({ product, layout = "grid", onQuickView, className }) {
  const { addItem, wishlist, toggleWish } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const wished = wishlist.includes(product.id);

  // Dynamic Image and Attribute Resolvers
  const mainImage = product.image || product.images?.[0]?.image_url || product.image_url || "/resources/js/assets/p-headphones.jpg";
  const hoverImage = product.hover || product.images?.[1]?.image_url || mainImage;
  const productUrl = `/product/${product.slug || product.id}`;
  const categoryName = typeof product.category === "object" ? product.category?.name : (product.category || "Atelier");
  const comparePrice = product.compare_at_price || product.compareAt;
  const reviewsCount = product.reviews_count ?? product.reviews ?? 0;
  const badgeText = product.badge || (product.is_on_sale ? "Sale" : (product.is_featured ? "Featured" : null));
  const colorsList = product.colors || product.variants?.map(v => ({ name: v.color_name, hex: v.color_hex })) || [];

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
          <Link href={productUrl} className="block h-full w-full">
            <img
              src={mainImage}
              alt={product.alt || product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          {badgeText && (
            <span
              className={cn(
                "absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase shadow-xs",
                badgeText === "Sale"
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface/90 text-foreground",
              )}
            >
              {badgeText}
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
              <span className="eyebrow">{categoryName}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{product.rating}</span>
                <span>({reviewsCount})</span>
              </div>
            </div>

            <Link
              href={productUrl}
              className="mt-1.5 block text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
            >
              {product.name}
            </Link>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {product.tagline || product.description}
            </p>

            {colorsList.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  {colorsList.length} Colors:
                </span>
                <div className="flex gap-1">
                  {colorsList.map((c, i) => (
                    <span
                      key={c.name || i}
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
              {comparePrice && (
                <span className="text-xs font-medium text-subtle line-through">
                  {formatPrice(comparePrice)}
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
        <Link href={productUrl} className="block relative aspect-4/5 w-full">
          <img
            src={mainImage}
            alt={product.alt || product.name}
            width={900}
            height={1100}
            loading="lazy"
            className="aspect-4/5 w-full object-cover transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-0"
          />
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            width={900}
            height={1100}
            loading="lazy"
            className="absolute inset-0 aspect-4/5 w-full scale-[1.04] object-cover opacity-0 transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        </Link>

        {badgeText ? (
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase shadow-xs pointer-events-none",
              badgeText === "Sale"
                ? "bg-accent text-accent-foreground"
                : "bg-surface/90 text-foreground",
            )}
          >
            {badgeText}
          </span>
        ) : null}

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300">
          <button
            type="button"
            onClick={() => toggleWish(product)}
            aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
            className={cn(
              "glass grid size-9 place-items-center rounded-full transition-all duration-300",
              wished ? "opacity-100 shadow-sm" : "opacity-0 group-hover:opacity-100 hover:scale-110",
            )}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                wished ? "fill-accent text-accent" : "text-foreground",
              )}
            />
          </button>
        </div>

        {/* Quick Add Overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 flex gap-2">
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="glass flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-surface/90 active:scale-95"
            >
              <Eye className="size-3.5" />
              <span>Quick View</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-lift transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
          >
            <ShoppingBag className="size-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="eyebrow">{categoryName}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="size-3 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{product.rating}</span>
              <span className="text-[11px]">({reviewsCount})</span>
            </div>
          </div>

          <Link
            href={productUrl}
            className="mt-1 block font-bold text-sm text-foreground transition-colors hover:text-accent line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-foreground">
              {formatPrice(product.price)}
            </span>
            {comparePrice && (
              <span className="text-xs font-medium text-subtle line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          {colorsList.length > 0 && (
            <div className="flex items-center -space-x-1">
              {colorsList.slice(0, 3).map((c, i) => (
                <span
                  key={c.name || i}
                  title={c.name}
                  className="size-3 rounded-full border border-surface shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {colorsList.length > 3 && (
                <span className="text-[10px] text-muted-foreground pl-1.5 font-medium">
                  +{colorsList.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
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
