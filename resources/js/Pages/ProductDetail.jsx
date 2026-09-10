import { useState, useEffect, useMemo, useRef } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
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
import { formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/site/cart";
import { ProductCard } from "@/components/site/product-card";
import { SiteLayout } from "@/layouts/site-layout";

export function ProductDetailPage({ product: serverProduct, relatedProducts: serverRelatedProducts }) {
  const { id, app_settings: appSettings = {} } = usePage().props;
  const navigate = (href) => router.visit(href);
  const { addItem, wishlist, toggleWish } = useCart();

  // Resolve product only from persisted server data.
  const product = useMemo(() => {
    return serverProduct || null;
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
  // Description expand/collapse
  const [descExpanded, setDescExpanded] = useState(false);

  // Formatted specifications & FAQs
  const formattedSpecs = useMemo(() => {
    if (!product?.specs) return [];
    if (Array.isArray(product.specs)) {
      return product.specs
        .map((s) => ({
          key: s.key || s.label || "",
          value: s.value || "",
        }))
        .filter((s) => s.key && s.value);
    }
    if (typeof product.specs === "object") {
      return Object.entries(product.specs)
        .map(([key, value]) => ({ key, value: String(value) }))
        .filter((s) => s.key && s.value);
    }
    return [];
  }, [product?.specs]);

  const formattedFaqs = useMemo(() => {
    if (!product?.faqs || !Array.isArray(product.faqs)) return [];
    return product.faqs
      .map((f) => ({
        question: f.question || f.q || "",
        answer: f.answer || f.a || "",
      }))
      .filter((f) => f.question && f.answer);
  }, [product?.faqs]);

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (formattedSpecs.length > 0) {
      tabs.push({ id: "specs", label: "Full Specifications" });
    }
    tabs.push({ id: "story", label: "Craft Narrative" });
    tabs.push({ id: "shipping", label: "Shipping & Free Returns" });
    if (formattedFaqs.length > 0) {
      tabs.push({ id: "faqs", label: "Common Questions" });
    }
    return tabs;
  }, [formattedSpecs, formattedFaqs]);

  // Active Deep Dive Tab
  const [activeTab, setActiveTab] = useState(() => (formattedSpecs.length > 0 ? "specs" : "story"));

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  // Frequently Bought Together bundle items state
  const bundleAccessories = useMemo(() => {
    if (!product) return [];
    return serverRelatedProducts || [];
  }, [product, serverRelatedProducts]);

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
    attachments: [],
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
      setActiveTab(formattedSpecs.length > 0 ? "specs" : "story");
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
        attachments: Array.isArray(r.attachments) ? r.attachments : [],
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

  // Resolve colors: supports object array (with hex) or string array (from available_colors DB field)
  const productColors = useMemo(() => {
    const src = product.colors || product.available_colors || product.variants?.map(v => ({ name: v.color_name, hex: v.color_hex, image: v.image_url })) || [];
    return src.map(c => typeof c === 'string' ? { name: c, hex: null } : c);
  }, [product]);

  // Resolve sizes: supports string array (from available_sizes DB field)
  const productSizes = useMemo(() => {
    return product.sizes || product.available_sizes || [];
  }, [product]);

  const chosenColor = productColors[selectedColorIdx] || productColors[0] || null;
  const chosenSize = productSizes[selectedSizeIdx] || null;

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

  // Order via WhatsApp handler
  const handleOrderViaWhatsApp = () => {
    const contact = appSettings?.contact || {};
    const general = appSettings?.general || {};
    const rawPhone = contact.phone || general.phone || "";
    const phoneDigits = rawPhone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (!phoneDigits) {
      toast.error("WhatsApp number not configured.");
      return;
    }
    const lines = [
      `🛍️ *New Order via WhatsApp*`,
      ``,
      `*Product:* ${product.name}`,
      chosenColor?.name ? `*Color:* ${chosenColor.name}` : null,
      chosenSize ? `*Size:* ${chosenSize}` : null,
      `*Qty:* ${quantity}`,
      `*Price:* ${formatPrice(product.price * quantity)}`,
      ``,
      `🔗 ${window.location.href}`,
    ].filter((l) => l !== null).join("\n");
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Frequently Bought Together Bundle calculation
  const allBundleItems = [product, ...bundleAccessories];
  const selectedBundleItems = allBundleItems.filter((_, idx) => bundleChecked[idx]);
  const getBundlePrice = (item) => {
    const price = Number(item?.price);
    return Number.isFinite(price) ? price : 0;
  };
  const getBundleOriginalPrice = (item) => {
    const originalPrice = Number(item?.compare_at_price ?? item?.compareAt);
    return Number.isFinite(originalPrice) && originalPrice > 0
      ? originalPrice
      : getBundlePrice(item) * 1.15;
  };
  const bundleTotalPrice = selectedBundleItems.reduce((acc, item) => acc + getBundlePrice(item), 0);
  const bundleOriginalPrice = selectedBundleItems.reduce((acc, item) => acc + getBundleOriginalPrice(item), 0);
  const bundleDiscount = Math.round(bundleOriginalPrice - bundleTotalPrice);

  const handleAddBundleToCart = () => {
    selectedBundleItems.forEach((item) => {
      addItem(item, 1, false);
    });
    toast.success("Bundle added to bag!", {
      description: `${selectedBundleItems.length} items added with discount savings.`,
    });
  };

  const handleReviewAttachmentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const uploadedImages = await Promise.all(
      files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      }))
    );

    setNewReviewForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...uploadedImages],
    }));

    event.target.value = "";
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
      attachments: newReviewForm.attachments || [],
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
    setNewReviewForm({ author: "", rating: 5, title: "", content: "", attachments: [] });
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

  // Rating summary & distribution breakdown stats
  const reviewStats = useMemo(() => {
    const totalCount = reviewsList.length;
    const avg = totalCount > 0
      ? reviewsList.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalCount
      : Number(product?.rating || 5);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const star = Math.round(Number(r.rating) || 5);
      if (counts[star] !== undefined) counts[star]++;
      else if (star >= 5) counts[5]++;
      else if (star <= 1) counts[1]++;
    });

    return {
      avg: Math.min(5, Math.max(0, avg)),
      totalCount,
      counts,
    };
  }, [reviewsList, product?.rating]);

  // Related products
  const relatedProducts = serverRelatedProducts || [];
  const productPrice = Number(product?.price || 0);
  const productImage = product?.images?.[0]?.image_url || product?.image;
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin },
      { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${window.location.origin}/shop` },
      categoryName && { "@type": "ListItem", "position": 3, "name": categoryName, "item": `${window.location.origin}/shop?category=${product?.category?.slug || "collection"}` },
      { "@type": "ListItem", "position": 4, "name": product?.name, "item": window.location.href.split("?")[0] },
    ].filter(Boolean),
  };

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.tagline || product.name,
    sku: product.sku || undefined,
    image: productImage ? [new URL(productImage, window.location.origin).href] : undefined,
    brand: { "@type": "Brand", name: "Atelier" },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: String(appSettings.general?.currency || "USD").split(" ")[0],
      price: productPrice.toFixed(2),
      availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: reviewsCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating || 0).toFixed(2),
      reviewCount: reviewsCount,
      bestRating: "5",
      worstRating: "1",
    } : undefined,
  } : null;

  return (
    <main className="min-h-screen pb-20 pt-28 lg:pt-36">
      <Head>
        <title head-key="title">{product?.name ? `${product.name} | Atelier` : "Product | Atelier"}</title>
        <meta head-key="description" name="description" content={(product?.description || product?.tagline || `Shop ${product?.name || "Atelier essentials"} from Atelier.`).slice(0, 160)} />
        <meta head-key="robots" name="robots" content="index,follow" />
        <link head-key="canonical" rel="canonical" href={window.location.href.split("?")[0]} />
        <meta head-key="og:type" property="og:type" content="product" />
        <meta head-key="og:title" property="og:title" content={`${product?.name || "Product"} | Atelier`} />
        <meta head-key="og:description" property="og:description" content={product?.tagline || product?.description || "Considered essentials from Atelier."} />
        {productImage && <meta head-key="og:image" property="og:image" content={new URL(productImage, window.location.origin).href} />}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Head>
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
                            ? "fill-[#f5a623] text-[#f5a623]"
                            : "fill-[#e5e7eb] text-[#e5e7eb] dark:fill-slate-700 dark:text-slate-700",
                        )}
                        strokeWidth={0}
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

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Attachments
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-background px-3 text-xs font-bold text-muted-foreground hover:border-accent hover:text-accent">
                    <Plus className="mr-2 size-4" />
                    Add Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleReviewAttachmentUpload}
                    />
                  </label>
                </div>

                {newReviewForm.attachments?.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {newReviewForm.attachments.map((attachment, index) => (
                      <div key={`${attachment}-${index}`} className="group relative overflow-hidden rounded-xl border border-border bg-muted">
                        <img src={attachment} alt={`Review attachment ${index + 1}`} className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewReviewForm((prev) => ({
                            ...prev,
                            attachments: (prev.attachments || []).filter((item) => item !== attachment),
                          }))}
                          className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-slate-900/80 text-white"
                          aria-label="Remove attachment"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* LEFT: Interactive Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-start">
            {images.length > 1 && (
              <div className="no-scrollbar flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={cn(
                      "relative size-18 sm:size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all bg-muted/20",
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
              className="relative aspect-square sm:aspect-[4/3] lg:aspect-square max-h-[460px] sm:max-h-[500px] lg:max-h-[520px] w-full flex-1 overflow-hidden rounded-3xl bg-muted/25 border border-border/60 group cursor-crosshair flex items-center justify-center shadow-xs"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={activeImage}
                alt={product.name}
                className={cn(
                  "h-full w-full object-contain p-2 sm:p-4 transition-transform duration-300",
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
          <div className="lg:col-span-6 flex flex-col justify-start">
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
                {(product.compare_at_price || product.compareAt) && Number(product.compare_at_price || product.compareAt) > Number(product.price) && (
                  <>
                    <span className="text-lg font-medium text-subtle line-through">
                      {formatPrice(product.compare_at_price || product.compareAt)}
                    </span>
                    <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                      Save {formatPrice((product.compare_at_price || product.compareAt) - product.price)}
                    </span>
                  </>
                )}
              </div>

              {product.tagline && (
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {product.tagline}
                </p>
              )}
              {product.description && (
                <div className="mt-3 relative">
                  <div
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-2 prose prose-sm dark:prose-invert max-w-none [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:text-foreground [&>strong]:font-semibold overflow-hidden transition-all duration-300",
                      descExpanded ? "max-h-none" : "max-h-[5.5rem]"
                    )}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                  {!descExpanded && (
                    <div className="absolute bottom-4 left-0 right-0 h-10 bg-gradient-to-t from-[#f8f7f4] to-transparent pointer-events-none" />
                  )}
                  <button
                    type="button"
                    onClick={() => setDescExpanded((e) => !e)}
                    className="mt-1.5 text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {descExpanded ? "See less ▲" : "See more ▼"}
                  </button>
                </div>
              )}
            </div>

            {/* Options selection form */}
            <div className="py-5 space-y-5 border-b border-border">
              {productColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-muted-foreground">
                      Color: <span className="text-foreground font-semibold">{chosenColor?.name}</span>
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                          "relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                          selectedColorIdx === idx
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-surface text-foreground hover:border-foreground/40",
                        )}
                      >
                        {c.hex && (
                          <span
                            className="size-3 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                        )}
                        {c.name}
                        {selectedColorIdx === idx && <Check className="size-3 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {productSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-muted-foreground">
                      Size: <span className="text-foreground font-semibold">{chosenSize || "Select a size"}</span>
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {productSizes.map((s, idx) => (
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
                      : "In Stock"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                  <Clock className="size-3" />
                  <span>Delivery in 3–5 business days</span>
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

                {/* Order via WhatsApp */}
                {(() => {
                  const contact = appSettings?.contact || {};
                  const general = appSettings?.general || {};
                  const rawPhone = contact.phone || general.phone || "";
                  if (!rawPhone) return null;
                  return (
                    <button
                      type="button"
                      id="order-via-whatsapp-btn"
                      onClick={handleOrderViaWhatsApp}
                      className="wa-order-btn h-11 w-full rounded-full text-xs font-bold text-white active:scale-[0.99] flex items-center justify-center gap-2 transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #25d366 0%, #128c50 100%)",
                        boxShadow: "0 4px 14px rgba(37,211,102,0.35)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, flexShrink: 0 }} aria-hidden="true">
                        <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" fill="#ffffff"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" fill="#ffffff"/>
                      </svg>
                      Order via WhatsApp
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Tags - only shown when product has tags */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1">Tags:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
                        {formatPrice(getBundlePrice(item))}
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

        {/* ================= 4. COMPACT TABBED SPECIFICATIONS & DEEP DIVE ================= */}
        <section className="mt-8 rounded-3xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs">
          {/* Pill Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {availableTabs.map((tab) => (
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
            {activeTab === "specs" && formattedSpecs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formattedSpecs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-muted/40 p-3 border border-border/60"
                  >
                    <span className="font-bold text-foreground">{spec.key}</span>
                    <span className="text-muted-foreground text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "story" && (
              <div className="space-y-3 leading-relaxed text-muted-foreground">
                {product.description ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:text-foreground [&>strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p>
                    Every piece in the collection is engineered to eliminate unnecessary bulk while maintaining architectural purity and tactile luxury.
                  </p>
                )}
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

            {activeTab === "faqs" && formattedFaqs.length > 0 && (
              <div className="space-y-3">
                {formattedFaqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <p className="font-bold text-foreground text-xs">{faq.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 5. COMPACT CUSTOMER REVIEWS DASHBOARD ================= */}
        <section id="reviews" className="mt-8 overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border bg-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <span className="eyebrow">Social Proof / 01</span>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Verified Buyer Reviews
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Real feedback from the Atelier community.</p>
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

          {/* Rating Summary + Distribution (Redesigned per Image 2) */}
          <div className="grid grid-cols-1 items-center gap-8 border-b border-border px-5 py-7 md:grid-cols-12 md:px-8">
            {/* Left Column: Big score /5, 5 Large Stars, and Ratings count */}
            <div className="flex flex-col items-start justify-center md:col-span-4 md:border-r md:border-border md:pr-8">
              <div className="flex items-baseline">
                <span className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
                  {reviewStats.avg.toFixed(1)}
                </span>
                <span className="text-2xl sm:text-3xl font-medium text-muted-foreground/60 ml-1">
                  /5
                </span>
              </div>

              {/* Large Stars with partial fill */}
              <div className="mt-3 flex items-center gap-1.5" aria-label={`${reviewStats.avg.toFixed(1)} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const fillPct = Math.min(100, Math.max(0, (reviewStats.avg - i) * 100));
                  return (
                    <div key={i} className="relative inline-block size-6 sm:size-7">
                      <Star
                        className="size-full fill-[#e5e7eb] text-[#e5e7eb] dark:fill-slate-700 dark:text-slate-700"
                        strokeWidth={0}
                      />
                      {fillPct > 0 && (
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ width: `${fillPct}%` }}
                        >
                          <Star
                            className="size-6 sm:size-7 fill-[#f5a623] text-[#f5a623]"
                            strokeWidth={0}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Ratings count */}
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                {reviewStats.totalCount} {reviewStats.totalCount === 1 ? "Rating" : "Ratings"}
              </p>
            </div>

            {/* Right Column: 5 Breakdown Rows (5 stars to 1 star) */}
            <div className="flex flex-col gap-2.5 md:col-span-8">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.counts[stars] || 0;
                const total = reviewStats.totalCount || 1;
                const pct = reviewStats.totalCount > 0 ? Math.round((count / total) * 100) : 0;
                const isFiltered = reviewFilterRating === stars;

                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() =>
                      setReviewFilterRating(reviewFilterRating === stars ? 0 : stars)
                    }
                    className={cn(
                      "group flex items-center w-full py-1 px-2.5 rounded-xl text-left transition-all cursor-pointer",
                      isFiltered
                        ? "bg-amber-500/10 ring-1 ring-amber-400"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* 5 Small Stars */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3.5 sm:size-4",
                            i < stars
                              ? "fill-[#f5a623] text-[#f5a623]"
                              : "fill-[#e5e7eb] text-[#e5e7eb] dark:fill-slate-700 dark:text-slate-700"
                          )}
                          strokeWidth={0}
                        />
                      ))}
                    </div>

                    {/* Clean Flat Progress Bar */}
                    <div className="flex-1 h-3 sm:h-3.5 mx-3 sm:mx-4 overflow-hidden rounded-xs bg-[#eef2f6] dark:bg-muted/70">
                      <div
                        className="h-full bg-[#f5a623] rounded-xs transition-[width] duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Count */}
                    <span className="w-6 text-right text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-foreground shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-7">
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
          <div className="grid grid-cols-1 gap-3.5 px-5 py-5 sm:px-7 md:grid-cols-2">
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
                              i < review.rating
                                ? "fill-[#f5a623] text-[#f5a623]"
                                : "fill-[#e5e7eb] text-[#e5e7eb] dark:fill-slate-700 dark:text-slate-700",
                            )}
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="mt-2.5 text-xs font-bold text-foreground">{review.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {review.content}
                    </p>

                    {Array.isArray(review.attachments) && review.attachments.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {review.attachments.map((attachment, index) => (
                          <a
                            key={`${attachment}-${index}`}
                            href={attachment}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-xl border border-border bg-muted"
                          >
                            <img src={attachment} alt={`Review attachment ${index + 1}`} className="aspect-square w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
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
