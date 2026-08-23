import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutGrid,
  List,
  Columns2,
  ChevronDown,
  ChevronUp,
  Star,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Package,
  Check,
  Tag,
  Filter,
} from "lucide-react";
import { products, categories, filters, sortOptions, formatPrice } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/site/product-card";
import { QuickViewModal } from "@/components/site/quick-view-modal";

const COLOR_FILTERS = [
  { name: "Black / Obsidian", hex: "#18181b" },
  { name: "White / Cream", hex: "#ede8df" },
  { name: "Silver / Slate", hex: "#94a3b8" },
  { name: "Tan / Brown", hex: "#b45309" },
  { name: "Brass / Gold", hex: "#d97706" },
  { name: "Olive / Green", hex: "#3f4f38" },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "featured";
  const initialSale = searchParams.get("sale") === "true";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPricePreset, setSelectedPricePreset] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 400]);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(initialSale);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sortBy, setSortBy] = useState(initialSort);

  const [layoutView, setLayoutView] = useState("grid-4"); // 'grid-4' | 'grid-3' | 'grid-2' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [visibleLimit, setVisibleLimit] = useState(12);

  // Sidebar collapsible sections
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    price: false,
    rating: false,
    availability: false,
    colors: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get("search");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
    const sale = searchParams.get("sale") === "true";
    if (sale !== onlySale) {
      setOnlySale(sale);
    }
  }, [searchParams]);

  // Update query params when category changes
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams, { replace: true });
    setVisibleLimit(9);
  };

  // Price preset handler
  const handlePricePreset = (preset) => {
    setSelectedPricePreset(preset);
    if (preset === "all") setPriceRange([0, 400]);
    else if (preset === "under-100") setPriceRange([0, 100]);
    else if (preset === "100-200") setPriceRange([100, 200]);
    else if (preset === "200-plus") setPriceRange([200, 400]);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPricePreset("all");
    setPriceRange([0, 400]);
    setMinRating(0);
    setOnlyInStock(false);
    setOnlySale(false);
    setSelectedColor(null);
    setSortBy("featured");
    setSearchParams({}, { replace: true });
    setVisibleLimit(9);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== "All" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(query);
          const matchCategory = product.category.toLowerCase().includes(query);
          const matchDesc = (product.description || "").toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchDesc) return false;
        }
        // Price filter
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }
        // Rating filter
        if (minRating > 0 && product.rating < minRating) {
          return false;
        }
        // Stock filter
        if (onlyInStock && !product.inStock) {
          return false;
        }
        // Sale filter
        if (onlySale && product.badge !== "Sale" && !product.compareAt) {
          return false;
        }
        // Color filter
        if (selectedColor) {
          const hasColor = product.colors?.some((c) =>
            c.name.toLowerCase().includes(selectedColor.toLowerCase()) ||
            selectedColor.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
          );
          if (!hasColor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating-desc") return b.rating - a.rating;
        if (sortBy === "reviews-desc") return b.reviews - a.reviews;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return a.id - b.id;
      });
  }, [selectedCategory, searchQuery, priceRange, minRating, onlyInStock, onlySale, selectedColor, sortBy]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (searchQuery.trim()) count++;
    if (selectedPricePreset !== "all" || priceRange[0] > 0 || priceRange[1] < 400) count++;
    if (minRating > 0) count++;
    if (onlyInStock) count++;
    if (onlySale) count++;
    if (selectedColor) count++;
    return count;
  }, [selectedCategory, searchQuery, selectedPricePreset, priceRange, minRating, onlyInStock, onlySale, selectedColor]);

  const displayedProducts = filteredProducts.slice(0, visibleLimit);
  const hasMore = visibleLimit < filteredProducts.length;

  // Sidebar Filter Content (Shared between desktop left column and mobile slide-in drawer)
  const FilterContent = () => (
    <div className="space-y-6 text-sm">
      {/* Active filters header / reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-accent" />
          <span className="font-bold text-foreground">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            <RotateCcw className="size-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Keyword Search */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Search
        </label>
        <div className="relative mt-2">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog…"
            className="h-10 w-full rounded-xl border border-border bg-surface pl-8 pr-8 text-xs placeholder:text-subtle focus:border-accent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Categories */}
      <div className="border-t border-border/80 pt-5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-foreground"
        >
          <span>Categories</span>
          {collapsedSections.categories ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground" />
          )}
        </button>

        {!collapsedSections.categories && (
          <div className="mt-3 space-y-1.5">
            {filters.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              const count =
                cat === "All"
                  ? products.length
                  : products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{cat}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Price Range */}
      <div className="border-t border-border/80 pt-5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-foreground"
        >
          <span>Price Range</span>
          {collapsedSections.price ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground" />
          )}
        </button>

        {!collapsedSections.price && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "under-100", label: "< $100" },
                { id: "100-200", label: "$100-$200" },
                { id: "200-plus", label: "$200+" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePricePreset(p.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all text-center",
                    selectedPricePreset === p.id
                      ? "border-accent bg-accent/10 text-accent font-bold"
                      : "border-border text-muted-foreground hover:border-foreground/30 bg-surface hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={priceRange[1]}
                onChange={(e) => {
                  setSelectedPricePreset("custom");
                  setPriceRange([priceRange[0], Number(e.target.value)]);
                }}
                className="mt-2 w-full accent-accent cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Customer Rating */}
      <div className="border-t border-border/80 pt-5">
        <button
          type="button"
          onClick={() => toggleSection("rating")}
          className="flex w-full items-center justify-between font-bold text-xs uppercase tracking-wider text-foreground"
        >
          <span>Rating</span>
          {collapsedSections.rating ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="size-4 text-muted-foreground" />
          )}
        </button>

        {!collapsedSections.rating && (
          <div className="mt-3 space-y-1.5">
            {[
              { val: 0, label: "Any Rating" },
              { val: 4.8, label: "4.8★ & above" },
              { val: 4.5, label: "4.5★ & above" },
              { val: 4.0, label: "4.0★ & above" },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => setMinRating(r.val)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left",
                  minRating === r.val
                    ? "bg-accent/10 text-accent font-bold border border-accent/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{r.label}</span>
                {r.val > 0 && <Star className="size-3.5 fill-accent text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Special Toggles */}
      <div className="border-t border-border/80 pt-5 space-y-2">
        <label className="flex items-center justify-between rounded-xl border border-border p-3 bg-surface cursor-pointer hover:border-foreground/30 transition-colors">
          <span className="text-xs font-semibold text-foreground">On Sale Only</span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => setOnlySale(e.target.checked)}
            className="size-4 accent-accent rounded"
          />
        </label>

        <label className="flex items-center justify-between rounded-xl border border-border p-3 bg-surface cursor-pointer hover:border-foreground/30 transition-colors">
          <span className="text-xs font-semibold text-foreground">In Stock Only</span>
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="size-4 accent-accent rounded"
          />
        </label>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pb-20 pt-28 lg:pt-36">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      <div className="shell">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">
            {selectedCategory === "All" ? "Shop All" : selectedCategory}
          </span>
        </nav>

        {/* Header Hero Section */}
        <div className="flex flex-col gap-3 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Atelier Catalog</span>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              {selectedCategory === "All" ? "Everyday Essentials" : `${selectedCategory} Collection`}
            </h1>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
              {selectedCategory === "All"
                ? "Discover precision-crafted audio, timeless timepieces, Mongolian cashmere, and artisanal home accents."
                : `Carefully crafted and sustainably sourced ${selectedCategory.toLowerCase()} for modern living.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface border border-border px-3.5 py-1.5 text-xs font-semibold shadow-2xs">
              <strong className="text-foreground font-bold">{filteredProducts.length}</strong> items available
            </span>
          </div>
        </div>

        {/* Main Two-Column Layout: Left Sidebar + Right Product Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= DESKTOP LEFT SIDEBAR ================= */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 rounded-3xl border border-border/80 bg-surface p-5 shadow-xs">
            <FilterContent />
          </aside>

          {/* ================= RIGHT MAIN AREA (Toolbar + Grid) ================= */}
          <div className="lg:col-span-9 flex flex-col">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-surface/90 p-3 backdrop-blur-md shadow-2xs">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex lg:hidden h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted"
              >
                <SlidersHorizontal className="size-4 text-accent" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Item Count readout on Desktop */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
                <span>Showing</span>
                <strong className="text-foreground font-bold">{displayedProducts.length}</strong>
                <span>of</span>
                <strong className="text-foreground font-bold">{filteredProducts.length}</strong>
                <span>products</span>
              </div>

              {/* Right Tools: Sorting & Layout switchers */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products"
                    className="h-10 appearance-none rounded-xl border border-border bg-surface pl-3 pr-8 text-xs font-semibold text-foreground transition-colors focus:border-accent focus:outline-none cursor-pointer"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>

                {/* Layout Toggles */}
                <div className="hidden sm:flex items-center rounded-xl border border-border bg-surface p-1 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setLayoutView("grid-4")}
                    title="4 Column Grid"
                    className={cn(
                      "grid size-8 place-items-center rounded-lg transition-colors",
                      layoutView === "grid-4" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutView("grid-3")}
                    title="3 Column Grid"
                    className={cn(
                      "grid size-8 place-items-center rounded-lg transition-colors",
                      layoutView === "grid-3" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Grid3X3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutView("grid-2")}
                    title="2 Column Grid"
                    className={cn(
                      "grid size-8 place-items-center rounded-lg transition-colors",
                      layoutView === "grid-2" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Columns2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutView("list")}
                    title="List View"
                    className={cn(
                      "grid size-8 place-items-center rounded-lg transition-colors",
                      layoutView === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Active:</span>
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {selectedCategory}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("All")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {selectedPricePreset !== "all" && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <button
                      type="button"
                      onClick={() => handlePricePreset("all")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    {minRating}★+
                    <button
                      type="button"
                      onClick={() => setMinRating(0)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {onlySale && (
                  <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    On Sale
                    <button
                      type="button"
                      onClick={() => setOnlySale(false)}
                      className="text-accent hover:text-accent-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {onlyInStock && (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    In Stock
                    <button
                      type="button"
                      onClick={() => setOnlyInStock(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-accent hover:underline ml-1"
                >
                  <RotateCcw className="size-3" />
                  Clear
                </button>
              </div>
            )}

            {/* Product Grid / List */}
            <div className="mt-6">
              {displayedProducts.length > 0 ? (
                <div
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    layoutView === "grid-4" && "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
                    layoutView === "grid-3" && "grid-cols-2 md:grid-cols-3",
                    layoutView === "grid-2" && "grid-cols-1 sm:grid-cols-2",
                    layoutView === "list" && "grid-cols-1",
                  )}
                >
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout={layoutView === "list" ? "list" : "grid"}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-10 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Package className="size-7 stroke-1" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold">No products match your filters</h3>
                  <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                    Try adjusting your search keywords, price limits, or category filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )}

              {/* Load More Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-border/80 pt-6">
                  <p className="text-xs font-medium text-muted-foreground">
                    Showing <strong className="text-foreground">{displayedProducts.length}</strong> of{" "}
                    <strong className="text-foreground">{filteredProducts.length}</strong> products
                  </p>
                  <div className="h-1.5 w-44 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((displayedProducts.length / filteredProducts.length) * 100))}%`,
                      }}
                    />
                  </div>

                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setVisibleLimit((v) => v + 6)}
                      className="mt-2 flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-6 text-xs font-bold text-foreground hover:border-foreground/40 hover:bg-muted transition-all"
                    >
                      <span>Load More Products</span>
                      <ChevronDown className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE-IN LEFT DRAWER ================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content on Left Side */}
          <div className="relative z-10 flex h-full w-full max-w-xs flex-col bg-surface p-5 shadow-2xl transition-transform animate-in slide-in-from-left">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-accent" />
                <h3 className="text-base font-bold">Filter Catalog</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
              <FilterContent />
            </div>

            {/* Drawer Sticky Footer */}
            <div className="border-t border-border pt-3 flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 h-11 rounded-full border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 h-11 rounded-full bg-primary text-xs font-bold text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
              >
                Show ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
