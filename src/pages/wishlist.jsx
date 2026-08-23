import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Share2, Sparkles, Package } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/site/cart";
import { products, formatPrice } from "@/lib/shop-data";
import { ProductCard } from "@/components/site/product-card";

export function WishlistPage() {
  const { wishlist, toggleWish, addItem } = useCart();

  const savedProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [wishlist]);

  const handleMoveAllToBag = () => {
    if (savedProducts.length === 0) return;
    savedProducts.forEach((item) => {
      addItem(item, 1, false);
    });
    toast.success("All saved items moved to bag!", {
      description: `${savedProducts.length} pieces added to your shopping bag.`,
    });
  };

  const handleShareWishlist = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Wishlist link copied to clipboard!");
    }
  };

  const recommendedProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">My Wishlist</span>
        </nav>

        {/* Wishlist Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="eyebrow">Saved Items</span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              My Wishlist ({savedProducts.length})
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Pieces you've curated for later. Prices and stock update in real time.
            </p>
          </div>

          {savedProducts.length > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleShareWishlist}
                className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                <Share2 className="size-3.5" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={handleMoveAllToBag}
                className="flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs"
              >
                <ShoppingBag className="size-4" />
                <span>Move All to Bag</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Grid */}
        {savedProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {savedProducts.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist State */
          <div className="my-14 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
              <Heart className="size-8 stroke-1 text-accent" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Your wishlist is empty</h2>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground">
              Explore the Atelier catalog and tap the heart icon on any product to save it to your wishlist.
            </p>
            <Link
              to="/shop"
              className="mt-6 flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {/* Recommended for you */}
        <section className="mt-20 border-t border-border pt-12">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Curated Picks</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
