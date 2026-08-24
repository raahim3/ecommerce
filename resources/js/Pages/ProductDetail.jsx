import { useState, useEffect, useMemo, useRef } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Star,
  Heart,
  Share2,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Leaf,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Sparkles,
  Maximize2,
  X,
  ThumbsUp,
  MessageSquarePlus,
  ArrowRight,
  Ruler,
  Clock,
  Layers,
  Award,
  HelpCircle,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { products, formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/site/cart";
import { ProductCard } from "@/components/site/product-card";
import { SiteLayout } from "@/layouts/site-layout";

export function ProductDetailPage({ product: serverProduct, relatedProducts: serverRelatedProducts }) {
  const { id } = usePage().props;
  const navigate = (href) => router.visit(href);
  const { addItem, wishlist, toggleWish } = useCart();

  // Resolve product from server prop or fallback by id/slug
  const product = useMemo(() => {
    if (serverProduct) return serverProduct;
    return products.find(
      (p) => String(p.id) === String(id) || p.slug === String(id),
    ) || products[0];
  }, [serverProduct, id]);

  // Resolve category name and slug
  const categoryName = typeof product.category === "object" ? product.category?.name : (product.category || "Collection");
  const categorySlug = typeof product.category === "object" ? product.category?.slug : (product.category || "all");
  const reviewsCount = product.reviews_count ?? (Array.isArray(product.reviews) ? product.reviews.length : (Number(product.reviews) || 0));

  // Gallery state - handles both database image objects and static asset strings
  const images = useMemo(() => {
    if (!product) return ["/resources/js/assets/p-headphones.jpg"];
    if (product.images && product.images.length > 0) {
      return product.images.map(img => typeof img === "object" ? img.image_url : img);
    }
    return [product.image || "/resources/js/assets/p-headphones.jpg", product.hover || product.image || "/resources/js/assets/p-headphones.jpg"];
  }, [product]);

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant selection
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Active Deep Dive Tab
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' | 'story' | 'shipping' | 'care'

  // Frequently Bought Together bundle items state
  const bundleAccessories = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.id !== product.id).slice(0, 2);
  }, [product]);

  const [bundleChecked, setBundleChecked] = useState([true, true, true]); // [main, acc1, acc2]

  // Reviews state & new review submission
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewFilterRating, setReviewFilterRating] = useState(0);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: "",
    rating: 5,
    title: "",
    content: "",
  });

  // Sticky add to cart bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBuyBtnRef = useRef(null);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setSelectedImgIdx(0);
      setSelectedColorIdx(0);
      setSelectedSizeIdx(0);
      setQuantity(1);
      setIsAdding(false);
      setActiveTab("specs");
      setBundleChecked([true, true, true]);
      setReviewFilterRating(0);
      setReviewSearchQuery("");

      // Normalize and load reviews from server or local storage fallback
      const normalizeReview = (r) => ({
        id: r.id,
        author: r.author_name || r.author || r.user?.name || "Verified Customer",
        rating: Number(r.rating) || 5,
        title: r.title || "Exceptional Quality",
        content: r.comment || r.content || "",
        date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (r.date || "Recently"),
        verified: r.is_verified_buyer ?? true,
        helpful: r.helpful || 0,
      });

      const serverRev = Array.isArray(product.reviews) ? product.reviews : (product.reviewsList || []);
      const savedReviews = localStorage.getItem(`atelier_reviews_${product.id}`);
      if (savedReviews) {
        try {
          const parsed = JSON.parse(savedReviews);
          setReviewsList(parsed.map(normalizeReview));
        } catch {
          setReviewsList(serverRev.map(normalizeReview));
        }
      } else {
        setReviewsList(serverRev.map(normalizeReview));
      }

      // Record recently viewed
      try {
        const stored = localStorage.getItem("atelier_recently_viewed");
        const list = stored ? JSON.parse(stored) : [];
        const updated = [product.id, ...list.filter((pid) => pid !== product.id)].slice(0, 6);
        localStorage.setItem("atelier_recently_viewed", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to store recently viewed", e);
      }
    }
  }, [product]);

  // Scroll listener for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainBuyBtnRef.current) return;
      const rect = mainBuyBtnRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Image Zoom Mouse Move
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        description: "You can share this product with friends.",
      });
    }
  };

  if (!product) {
    return (
      <main className="shell flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <h1 className="text-3xl font-extrabold">Product Not Found</h1>
        <p className="mt-3 text-muted-foreground">The product you are looking for does not exist or has been retired.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Return to Shop
        </Link>
      </main>
    );
  }

  const wished = wishlist.includes(product.id);
  const activeImage = images[selectedImgIdx] || images[0] || "/resources/js/assets/p-headphones.jpg";
  const productColors = useMemo(() => product.colors || product.variants?.map(v => ({ name: v.color_name, hex: v.color_hex, image: v.image_url })) || [], [product]);
  const chosenColor = productColors[selectedColorIdx] || productColors[0] || null;
  const chosenSize = product.sizes && product.sizes[selectedSizeIdx] ? product.sizes[selectedSizeIdx] : null;

  // Add to cart handler
  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(
      {
        ...product,
        selectedColor: chosenColor?.name,
        selectedSize: chosenSize,
      },
      quantity,
      true, // open cart drawer
    );
    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  // Buy now direct handler
  const handleBuyNow = () => {
    addItem(
      {
        ...product,
        selectedColor: chosenColor?.name,
        selectedSize: chosenSize,
      },
      quantity,
      false,
    );
    navigate("/checkout");
  };

  // Frequently Bought Together Bundle calculation
  const allBundleItems = [product, ...bundleAccessories];
  const selectedBundleItems = allBundleItems.filter((_, idx) => bundleChecked[idx]);
  const bundleTotalPrice = selectedBundleItems.reduce((acc, item) => acc + item.price, 0);
  const bundleOriginalPrice = selectedBundleItems.reduce((acc, item) => acc + (item.compareAt || item.price * 1.15), 0);
  const bundleDiscount = Math.round(bundleOriginalPrice - bundleTotalPrice);

  const handleAddBundleToCart = () => {
    selectedBundleItems.forEach((item) => {
      addItem(item, 1, false);
    });
    toast.success("Bundle added to bag!", {
      description: `${selectedBundleItems.length} items added with discount savings.`,
    });
  };

  // Submit new review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewForm.author.trim() || !newReviewForm.content.trim()) {
      toast.error("Please provide your name and review details");
      return;
    }

    const newReview = {
      id: `custom-${Date.now()}`,
      author: newReviewForm.author,
      rating: Number(newReviewForm.rating),
      date: "Just now",
      verified: true,
      title: newReviewForm.title || "Exceptional Quality",
      content: newReviewForm.content,
      helpful: 1,
    };

    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem(`atelier_reviews_${product.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    toast.success("Review submitted!", {
      description: "Thank you for sharing your feedback with the Atelier community.",
    });

    setIsWriteReviewOpen(false);
    setNewReviewForm({ author: "", rating: 5, title: "", content: "" });
  };

  // Upvote review
  const handleUpvoteReview = (reviewId) => {
    const updated = reviewsList.map((r) =>
      r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r,
    );
    setReviewsList(updated);
    try {
      localStorage.setItem(`atelier_reviews_${product.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    toast.success("Marked as helpful!");
  };

  // Filter reviews
  const displayedReviews = reviewsList.filter((r) => {
    if (reviewFilterRating > 0 && r.rating !== reviewFilterRating) return false;
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      return (
        r.content.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Related products
  const relatedProducts = (serverRelatedProducts && serverRelatedProducts.length > 0)
    ? serverRelatedProducts
    : products
        .filter((p) => p.id !== product?.id && p.category === product?.category)
        .concat(products.filter((p) => p.id !== product?.id && p.category !== product?.category))
        .slice(0, 4);

  return (
    <main className="min-h-screen pb-20 pt-28 lg:pt-36">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur-md p-4 animate-in fade-in">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
          >
            <X className="size-6" />
          </button>
          <div className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-3xl">
            <img src={activeImage} alt={product.name} className="h-full w-full object-contain" />
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Ruler className="size-5 text-accent" />
                <h3 className="text-lg font-bold">Size & Fit Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-muted-foreground">
              <p>All measurements are listed in inches with standard European tailoring proportions.</p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left">
                  <thead className="bg-muted text-[11px] font-bold text-foreground">
                    <tr>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Chest</th>
                      <th className="p-2.5">Waist</th>
                      <th className="p-2.5">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-foreground">S</td>
                      <td className="p-2.5">36–38"</td>
                      <td className="p-2.5">29–31"</td>
                      <td className="p-2.5">27.5"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-foreground">M</td>
                      <td className="p-2.5">39–41"</td>
                      <td className="p-2.5">32–34"</td>
                      <td className="p-2.5">28.5"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-foreground">L</td>
                      <td className="p-2.5">42–44"</td>
                      <td className="p-2.5">35–37"</td>
                      <td className="p-2.5">29.5"</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-foreground">XL</td>
                      <td className="p-2.5">45–47"</td>
                      <td className="p-2.5">38–40"</td>
                      <td className="p-2.5">30.5"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsWriteReviewOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-surface p-6 sm:p-8 shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold">Write a Customer Review</h3>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Overall Rating
                </label>
                <div className="mt-1.5 flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewReviewForm((f) => ({ ...f, rating: val }))}
                      className="grid size-9 place-items-center rounded-xl border border-border hover:border-accent transition-colors"
                    >
                      <Star
                        className={cn(
                          "size-5",
                          val <= newReviewForm.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/40",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newReviewForm.author}
                  onChange={(e) => setNewReviewForm((f) => ({ ...f, author: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incredible craftsmanship and feel"
                  value={newReviewForm.title}
                  onChange={(e) => setNewReviewForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detailed Comments
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thoughts on build quality, fit, and materials…"
                  value={newReviewForm.content}
                  onChange={(e) => setNewReviewForm((f) => ({ ...f, content: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3.5 text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="shell">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight className="size-3.5" />
          <Link
            href={`/shop?category=${categorySlug}`}
            className="hover:text-foreground transition-colors"
          >
            {categoryName}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* ================= 1. FIRST HERO SECTION (Gallery + Purchase details) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          {/* LEFT: Interactive Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {images.length > 1 && (
              <div className="no-scrollbar flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={cn(
                      "relative size-20 sm:size-22 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                      selectedImgIdx === idx
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-transparent opacity-65 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image with Zoom */}
            <div
              className="relative aspect-4/5 w-full flex-1 overflow-hidden rounded-3xl bg-muted group cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={activeImage}
                alt={product.name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300",
                  isZoomed && "scale-150",
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : undefined
                }
              />

              {product.badge && (
                <span
                  className={cn(
                    "absolute top-4 left-4 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase shadow-sm pointer-events-none",
                    product.badge === "Sale"
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface/90 text-foreground",
                  )}
                >
                  {product.badge}
                </span>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button
                  type="button"
                  onClick={() => toggleWish(product)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  className="glass grid size-10 place-items-center rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Heart
                    className={cn(
                      "size-4.5",
                      wished ? "fill-accent text-accent" : "text-foreground",
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View Fullscreen"
                  className="glass grid size-10 place-items-center rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Maximize2 className="size-4.5 text-foreground" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="glass grid size-10 place-items-center rounded-full transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="size-4.5 text-foreground" />
                </button>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Hover to zoom • Click to expand
              </div>
            </div>
          </div>

          {/* RIGHT: Product Buy & Configuration */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="border-b border-border pb-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="eyebrow">{categoryName}</span>
                {product.sku && <span className="font-mono text-[11px]">SKU: {product.sku}</span>}
              </div>

              <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                {product.name}
              </h1>

              <div className="mt-2.5 flex items-center gap-3 text-sm">
                <a
                  href="#reviews"
                  className="flex items-center gap-1.5 text-accent font-semibold hover:underline"
                >
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3.5",
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "fill-muted text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-bold text-xs">{product.rating}</span>
                </a>
                <span className="text-muted-foreground text-xs">•</span>
                <a href="#reviews" className="text-muted-foreground hover:text-foreground text-xs font-medium">
                  {reviewsCount} reviews
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
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

              <p className="mt-2 text-xs text-muted-foreground">
                4 interest-free payments of <strong>{formatPrice(product.price / 4)}</strong> with Klarna.
              </p>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {product.tagline || product.description}
              </p>
            </div>

            {/* Options selection form */}
            <div className="py-5 space-y-5 border-b border-border">
              {productColors && productColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-muted-foreground">
                      Color: <span className="text-foreground font-semibold">{chosenColor?.name}</span>
                    </label>
                  </div>
                  <div className="mt-2 flex gap-2.5">
                    {productColors.map((c, idx) => (
                      <button
                        key={c.name || idx}
                        type="button"
                        onClick={() => {
                          setSelectedColorIdx(idx);
                          if (c.image && images.includes(c.image)) {
                            setSelectedImgIdx(images.indexOf(c.image));
                          }
                        }}
                        title={c.name}
                        className={cn(
                          "relative grid size-8 place-items-center rounded-full transition-all",
                          selectedColorIdx === idx
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface scale-110 shadow-sm"
                            : "hover:scale-105 opacity-80 hover:opacity-100",
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {selectedColorIdx === idx && (
                          <Check
                            className={cn(
                              "size-3.5",
                              c.hex === "#fafafa" || c.hex === "#eae4d9" || c.hex === "#ede8df"
                                ? "text-ink"
                                : "text-white",
                            )}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 1 && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-muted-foreground">
                      Size: <span className="text-foreground font-semibold">{chosenSize}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-accent font-semibold hover:underline cursor-pointer"
                    >
                      <Ruler className="size-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s, idx) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSizeIdx(idx)}
                        className={cn(
                          "min-w-11 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
                          selectedSizeIdx === idx
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border text-foreground hover:border-foreground/40 bg-surface",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/60 p-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {product.stockCount && product.stockCount < 10
                      ? `Only ${product.stockCount} left in stock`
                      : "In Stock • Ships in 24 hours"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                  <Clock className="size-3" />
                  <span>Delivery in 2–4 business days</span>
                </div>
              </div>

              {/* Quantity Stepper and Add to Bag */}
              <div ref={mainBuyBtnRef} className="flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                  <div className="flex items-center rounded-full border border-border bg-surface p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="grid size-9 place-items-center rounded-full text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="grid size-9 place-items-center rounded-full text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 h-11 rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:scale-[0.99]"
                  >
                    {isAdding ? "Adding to Bag..." : `Add to Bag • ${formatPrice(product.price * quantity)}`}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="h-11 w-full rounded-full border border-primary bg-transparent text-xs font-bold text-foreground transition-all duration-300 hover:bg-foreground hover:text-background active:scale-[0.99]"
                >
                  Buy with Express Checkout
                </button>
              </div>
            </div>

            {/* 4 Trust Guarantee micro-items */}
            <div className="grid grid-cols-2 gap-2 pt-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-border/70 p-2.5">
                <Truck className="size-3.5 shrink-0 text-accent" />
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-border/70 p-2.5">
                <RotateCcw className="size-3.5 shrink-0 text-accent" />
                <span>30-day free returns</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-border/70 p-2.5">
                <ShieldCheck className="size-3.5 shrink-0 text-accent" />
                <span>2-year warranty</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-border/70 p-2.5">
                <Leaf className="size-3.5 shrink-0 text-accent" />
                <span>Eco-friendly packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. FREQUENTLY BOUGHT TOGETHER BUNDLE ================= */}
        <section className="mt-10 rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <h2 className="text-base font-bold text-foreground">Frequently Bought Together</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Bundle Item Visuals & Checkboxes */}
            <div className="lg:col-span-8 flex flex-wrap items-center gap-3 sm:gap-4">
              {allBundleItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-2.5 transition-all",
                      bundleChecked[idx]
                        ? "border-accent/40 bg-accent/5"
                        : "border-border opacity-50 bg-surface",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={bundleChecked[idx]}
                      onChange={(e) => {
                        const updated = [...bundleChecked];
                        updated[idx] = e.target.checked;
                        setBundleChecked(updated);
                      }}
                      className="size-4 accent-accent rounded"
                    />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 rounded-xl object-cover border border-border/60 shrink-0"
                    />
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-bold text-foreground truncate max-w-[130px] sm:max-w-[160px]">
                        {item.name}
                      </p>
                      <p className="text-xs font-extrabold text-foreground mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {idx < allBundleItems.length - 1 && (
                    <Plus className="size-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Bundle Pricing & Action */}
            <div className="lg:col-span-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-foreground">
                  {formatPrice(bundleTotalPrice)}
                </span>
                {bundleDiscount > 0 && (
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    Save {formatPrice(bundleDiscount)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                For {selectedBundleItems.length} selected pieces
              </p>
              <button
                type="button"
                onClick={handleAddBundleToCart}
                disabled={selectedBundleItems.length === 0}
                className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-xs"
              >
                <ShoppingBag className="size-3.5" />
                <span>Add Bundle to Bag</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================= 3. BENTO HIGHLIGHTS & SPECS MATRIX (High-density, No Whitespace) ================= */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Key Highlights */}
          <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <Layers className="size-4" />
                <span>Design Highlights</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Engineered for Daily Rituals</h3>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                {product.highlights?.slice(0, 4).map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="size-3.5 text-accent shrink-0 mt-0.5" />
                    <span className="text-foreground/90 font-medium leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2: Materials & Origin */}
          <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <Award className="size-4" />
                <span>Material Craftsmanship</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Sustainably Sourced</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Handcrafted using certified sustainable inputs and non-toxic dyes in compliant ateliers. Each batch undergoes 18 rigorous quality checks.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground">
                  Grade-A Materials
                </span>
                <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground">
                  Traceable Origin
                </span>
                <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground">
                  Zero Waste Finishing
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Assistance & Delivery */}
          <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                <PackageCheck className="size-4" />
                <span>Atelier Concierge</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Questions or Customization?</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Our in-house product specialists and stylists are on standby to guide your selection and sizing.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
              >
                <MessageCircle className="size-3.5" />
                <span>Chat with an Atelier Stylist</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 4. COMPACT TABBED SPECIFICATIONS & DEEP DIVE ================= */}
        <section className="mt-8 rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs">
          {/* Pill Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {[
              { id: "specs", label: "Full Specifications" },
              { id: "story", label: "Craft Narrative" },
              { id: "shipping", label: "Shipping & Free Returns" },
              { id: "faqs", label: "Common Questions" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="mt-5 text-xs sm:text-sm">
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specs?.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border/60"
                  >
                    <span className="font-bold text-foreground">{spec.label}</span>
                    <span className="text-muted-foreground text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "story" && (
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                <p>{product.description}</p>
                <p>
                  Every piece in the Atelier line is engineered to eliminate unnecessary bulk while maintaining architectural purity and tactile luxury.
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/80 p-4 bg-muted/30">
                  <h4 className="font-bold text-foreground">Global Delivery</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Complimentary standard shipping on orders over $100. Dispatches within 24 hours with full tracking.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/80 p-4 bg-muted/30">
                  <h4 className="font-bold text-foreground">30-Day Risk-Free Returns</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Return or exchange any undamaged item in its original packaging within 30 days. Prepaid return label included.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "faqs" && (
              <div className="space-y-3">
                {product.faqs?.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <p className="font-bold text-foreground text-xs">{faq.q}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 5. COMPACT CUSTOMER REVIEWS DASHBOARD ================= */}
        <section id="reviews" className="mt-8 rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="eyebrow">Social Proof</span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                Verified Buyer Reviews
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs self-start sm:self-auto"
            >
              <MessageSquarePlus className="size-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary + Distribution */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-border pb-6">
            {/* Score box */}
            <div className="md:col-span-4 flex items-center gap-4">
              <div className="text-5xl font-extrabold tracking-tight text-foreground">
                {product.rating}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {reviewsList.length} verified ratings
                </p>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="md:col-span-8 grid grid-cols-5 gap-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const total = reviewsList.length || 1;
                const count = reviewsList.filter((r) => r.rating === stars).length;
                const pct = Math.round((count / total) * 100);
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() =>
                      setReviewFilterRating(reviewFilterRating === stars ? 0 : stars)
                    }
                    className={cn(
                      "flex flex-col items-center rounded-xl p-2 text-xs font-semibold transition-all text-center",
                      reviewFilterRating === stars
                        ? "bg-accent/10 border border-accent text-accent"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground",
                    )}
                  >
                    <span>{stars}★</span>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden my-1">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Filter Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                placeholder="Search reviews…"
                className="h-9 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs placeholder:text-subtle focus:border-accent focus:outline-none"
              />
            </div>

            {reviewFilterRating > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-accent/10 border border-accent px-3 py-1 text-xs font-bold text-accent flex items-center gap-1">
                  {reviewFilterRating} Star Reviews
                  <button
                    type="button"
                    onClick={() => setReviewFilterRating(0)}
                    className="hover:opacity-70"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Compact Review Cards Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedReviews.length > 0 ? (
              displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-border/80 bg-background/50 p-4 transition-all hover:border-foreground/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold text-foreground">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{review.author}</p>
                          <span className="text-[10px] text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3",
                              i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/30",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="mt-2.5 text-xs font-bold text-foreground">{review.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {review.content}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="size-3" /> Verified Buyer
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpvoteReview(review.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ThumbsUp className="size-3" />
                      <span>Helpful ({review.helpful || 0})</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 py-6 text-center text-xs text-muted-foreground">
                No reviews match your search filter.
              </p>
            )}
          </div>
        </section>

        {/* ================= 6. RECOMMENDED FOR YOU ================= */}
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Curated Pairing</span>
              <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight">
                Recommended For You
              </h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-1 text-xs font-bold text-foreground hover:text-accent transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Purchase Bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur-md shadow-2xl transition-all duration-300",
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="shell flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={activeImage}
              alt=""
              className="size-11 rounded-xl object-cover border border-border shrink-0"
            />
            <div className="min-w-0">
              <h4 className="truncate text-xs sm:text-sm font-bold text-foreground">{product.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {chosenColor && (
                  <span className="hidden sm:inline text-[11px] text-muted-foreground">
                    • {chosenColor.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
            >
              Add to Bag • {formatPrice(product.price * quantity)}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

ProductDetailPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default ProductDetailPage;
