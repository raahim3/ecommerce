import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  Minus,
  X,
  Sparkles,
  Info,
  Check,
  ChevronDown,
  GripVertical,
  Eye,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Fashion", "Electronics", "Accessories", "Lifestyle"];
const SUB_CATEGORIES = {
  Fashion: ["Cashmere Knitwear", "Linen Shirts", "Outerwear"],
  Electronics: ["Headphones & Audio", "Cables & Accessories"],
  Accessories: ["Timepieces & Watches", "Leather Bags", "Eyewear"],
  Lifestyle: ["Ceramics & Vessels", "Fragrance & Diffusers"],
};

const EMPTY_PRODUCT = {
  title: "",
  handle: "",
  description: "",
  price: "",
  comparePrice: "",
  costPerItem: "",
  sku: "",
  barcode: "",
  trackInventory: true,
  stock: "",
  status: "Active",
  category: "Fashion",
  subcategory: "",
  vendor: "Atelier Studios",
  productType: "",
  tags: [],
  seoTitle: "",
  seoDescription: "",
  seoHandle: "",
  weight: "",
  freeShipping: true,
};

export function AdminProductCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([
    { id: 1, name: "Color", values: ["Obsidian Black", "Chalk White"] },
    { id: 2, name: "Size", values: ["XS", "S", "M", "L", "XL"] },
  ]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantVal, setNewVariantVal] = useState("");
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((f) => ({ ...f, title, handle, seoTitle: title, seoHandle: handle }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setField("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => setField("tags", form.tags.filter((t) => t !== tag));

  const handleAddVariantValue = (variantId) => {
    if (!newVariantVal.trim()) return;
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, values: [...v.values, newVariantVal.trim()] } : v
      )
    );
    setNewVariantVal("");
  };

  const handleRemoveVariantValue = (variantId, val) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, values: v.values.filter((x) => x !== val) } : v
      )
    );
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    setVariants((prev) => [...prev, { id: Date.now(), name: newVariantName.trim(), values: [] }]);
    setNewVariantName("");
  };

  const calcMargin = () => {
    const price = parseFloat(form.price) || 0;
    const cost = parseFloat(form.costPerItem) || 0;
    if (!price || !cost) return null;
    const profit = price - cost;
    const margin = ((profit / price) * 100).toFixed(1);
    return { profit: profit.toFixed(2), margin };
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.price) {
      toast.error("Product title and price are required.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Product published to catalog!", {
        description: `"${form.title}" is now ${form.status === "Active" ? "live on your storefront" : "saved as a draft"}.`,
      });
      navigate("/admin/products");
    }, 800);
  };

  const profitData = calcMargin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Create New Product</h1>
            <p className="text-xs text-slate-500 mt-0.5">Fill in all details then publish to your storefront.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setField("status", "Draft"); handleSave(); }}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-70"
          >
            {isSaving ? (
              <><span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Publishing...</>
            ) : (
              <><Sparkles className="size-3.5" /> Publish Product</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========== LEFT MAIN COLUMN (8 cols) ========== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Information */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Product Information</h2>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Heavy Rib Cashmere Knit — Oatmeal Cream"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">URL Handle</label>
              <div className="mt-1 flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <span className="text-xs text-slate-400 shrink-0">/products/</span>
                <input
                  type="text"
                  value={form.handle}
                  onChange={(e) => setField("handle", e.target.value)}
                  className="flex-1 bg-transparent font-mono text-xs text-slate-700 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Description & Craftsmanship Notes</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the product, its materials, craftsmanship, and unique attributes. Markdown supported."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* Media Gallery */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Product Media Gallery</h2>
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors"
              onClick={() => toast.info("Image upload dialog would open here.")}
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-slate-200">
                <Upload className="size-6 text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Drag & drop product images here</p>
                <p className="text-xs text-slate-400 mt-0.5">or click to browse — JPG, PNG, WEBP up to 20MB each</p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                Upload Images
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Tip: First image will be the cover/thumbnail. Recommended resolution: 1200×1200px minimum.</p>
          </div>

          {/* Pricing Matrix */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Pricing & Margins</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Retail Price *</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="0.00"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 text-sm font-semibold focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Compare-at Price</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => setField("comparePrice", e.target.value)}
                    placeholder="0.00"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 text-sm font-semibold focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cost Per Item</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={form.costPerItem}
                    onChange={(e) => setField("costPerItem", e.target.value)}
                    placeholder="0.00"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 text-sm font-semibold focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            {/* Profit Margin Display */}
            {profitData && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Profit / Unit</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">${profitData.profit}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-sky-600">Gross Margin</p>
                  <p className="text-lg font-extrabold text-sky-700 mt-0.5">{profitData.margin}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Inventory & SKU</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="e.g. ATL-KNT-001-OAT"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-xs uppercase focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Barcode (EAN / UPC)</label>
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => setField("barcode", e.target.value)}
                  placeholder="e.g. 5901234123457"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-xs focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={cn("relative h-5 w-10 rounded-full transition-colors", form.trackInventory ? "bg-slate-900" : "bg-slate-200")}
                onClick={() => setField("trackInventory", !form.trackInventory)}
              >
                <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", form.trackInventory ? "translate-x-5" : "translate-x-0.5")} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Track Inventory Quantity</p>
                <p className="text-[11px] text-slate-400">Atelier will monitor stock levels and show Out of Stock status automatically</p>
              </div>
            </label>

            {form.trackInventory && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Stock (On Hand)</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setField("stock", e.target.value)}
                  placeholder="0"
                  className="mt-1 h-11 w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:border-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Product Variants */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Variants (Color, Size, Material)</h2>
            </div>

            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{variant.name}</span>
                    <button
                      type="button"
                      onClick={() => setVariants((prev) => prev.filter((v) => v.id !== variant.id))}
                      className="grid size-6 place-items-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="size-3" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((val) => (
                      <span key={val} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
                        {val}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantValue(variant.id, val)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {activeVariantId === variant.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newVariantVal}
                        onChange={(e) => setNewVariantVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddVariantValue(variant.id)}
                        placeholder={`Add ${variant.name} option…`}
                        className="h-9 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleAddVariantValue(variant.id)}
                        className="h-9 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Add
                      </button>
                      <button type="button" onClick={() => setActiveVariantId(null)} className="grid size-9 place-items-center rounded-xl border border-slate-200 hover:bg-slate-100">
                        <X className="size-3.5 text-slate-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVariantId(variant.id)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
                    >
                      <Plus className="size-3" /> Add {variant.name} Option
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddVariant()}
                placeholder="New variant name (e.g. Material)"
                className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Plus className="size-3.5" /> Add Variant
              </button>
            </div>
          </div>

          {/* SEO Preview */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Search Engine Listing Preview</h2>

            {/* Google Preview */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
              <p className="text-xs text-slate-400">Preview in Google Search Results:</p>
              <p className="text-sm text-blue-700 font-semibold">{form.seoTitle || "Product Title | Atelier Studios"}</p>
              <p className="text-xs text-emerald-700">atelier-studios.com/products/{form.seoHandle || "product-handle"}</p>
              <p className="text-xs text-slate-600 line-clamp-2">{form.seoDescription || "Your SEO meta description will appear here. Make it compelling and 155 characters or fewer."}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">SEO Title</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setField("seoTitle", e.target.value)}
                maxLength={60}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-slate-900 focus:bg-white focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">{form.seoTitle.length}/60 characters</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Meta Description</label>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setField("seoDescription", e.target.value)}
                maxLength={155}
                placeholder="Craft a compelling 155-character description for Google and social sharing..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-slate-900 focus:bg-white focus:outline-none resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">{form.seoDescription.length}/155 characters</p>
            </div>
          </div>
        </div>

        {/* ========== RIGHT PANEL (4 cols) ========== */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* Publishing Status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Publishing Status</h3>
            <div className="space-y-2">
              {["Active", "Draft", "Scheduled"].map((s) => (
                <label key={s} className={cn("flex items-center gap-3 rounded-xl p-3 cursor-pointer border transition-colors", form.status === s ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:bg-slate-50")}>
                  <div className={cn("grid size-4 place-items-center rounded-full border-2", form.status === s ? "border-slate-900 bg-slate-900" : "border-slate-300")}>
                    {form.status === s && <Check className="size-2.5 text-white" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s}</p>
                    <p className="text-[11px] text-slate-400">
                      {s === "Active" ? "Live on storefront" : s === "Draft" ? "Hidden from shoppers" : "Schedule for later"}
                    </p>
                  </div>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="sr-only" />
                </label>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Product Organization</h3>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none"
              >
                {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subcategory</label>
              <select
                value={form.subcategory}
                onChange={(e) => setField("subcategory", e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:border-slate-900 focus:outline-none"
              >
                <option value="">Select subcategory...</option>
                {(SUB_CATEGORIES[form.category] || []).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Vendor / Brand</label>
              <input type="text" value={form.vendor} onChange={(e) => setField("vendor", e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tags & Badges</label>
              <div className="mt-1 flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)}><X className="size-2.5 text-slate-400" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Best Seller, New Arrival..."
                  className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none"
                />
                <button type="button" onClick={handleAddTag} className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Shipping & Physical</h3>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Weight (grams)</label>
              <input type="number" value={form.weight} onChange={(e) => setField("weight", e.target.value)} placeholder="e.g. 450" className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs focus:border-slate-900 focus:outline-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={cn("relative h-5 w-10 rounded-full transition-colors", form.freeShipping ? "bg-emerald-500" : "bg-slate-200")}
                onClick={() => setField("freeShipping", !form.freeShipping)}
              >
                <div className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform", form.freeShipping ? "translate-x-5" : "translate-x-0.5")} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Eligible for Free Shipping</p>
                <p className="text-[11px] text-slate-400">On orders qualifying for free delivery</p>
              </div>
            </label>
          </div>

          {/* Save Sticky */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 shadow-lg disabled:opacity-70 transition-all active:scale-[0.99]"
          >
            <Save className="size-4" /> Save & Publish Product
          </button>
        </div>
      </div>
    </div>
  );
}
