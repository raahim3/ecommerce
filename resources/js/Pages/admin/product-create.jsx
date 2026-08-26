import { useState, useCallback, useRef, useMemo } from "react";
import { Link, router } from "@inertiajs/react";
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
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Star,
  HelpCircle,
  Sliders,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

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
  weightKg: "",
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

export function AdminProductCreatePage({ categories: serverCategories = [], product = null }) {
  const navigate = (href) => router.visit(href);
  const isEditing = !!product;

  const [form, setForm] = useState({
    ...EMPTY_PRODUCT,
    title: product?.name || "",
    handle: product?.slug || "",
    description: product?.description || "",
    price: product?.price ? String(product.price) : "",
    compareAtPrice: product?.compare_at_price || product?.original_price ? String(product.compare_at_price || product.original_price) : "",
    inventoryQty: product?.stock_quantity !== undefined ? String(product.stock_quantity) : "25",
    weightKg: product?.weight_kg !== undefined ? String(product.weight_kg) : "",
    sku: product?.sku || "",
    status: product ? (product.is_active ? "Active" : "Draft") : "Active",
    category: product?.category?.name || serverCategories[0]?.name || "Fashion",
  });

  const [tagInput, setTagInput] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantVal, setNewVariantVal] = useState("");
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState(
    product?.images?.map((i) => i.image_url) || (product?.image ? [product.image] : [])
  );
  const [variants, setVariants] = useState([
    { id: 1, name: "Color", values: ["Obsidian Black", "Chalk White"] },
    { id: 2, name: "Size", values: ["XS", "S", "M", "L", "XL"] },
  ]);
  // Full Specifications State
  const initialSpecs = useMemo(() => {
    if (product?.specs && typeof product.specs === "object") {
      if (Array.isArray(product.specs)) return product.specs;
      return Object.entries(product.specs).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: "Material Composition", value: "100% Grade-A Mongolian Cashmere" },
      { key: "Origin & Milling", value: "Ulaanbaatar, Mongolia" },
      { key: "Knit Gauge & Weight", value: "7-Gauge Heavy Rib • 420 GSM" },
      { key: "Care Recommendations", value: "Dry clean or gentle hand wash in cold water" },
    ];
  }, [product]);

  const [specs, setSpecs] = useState(initialSpecs);

  // Common Questions (FAQs) State
  const initialFaqs = useMemo(() => {
    if (product?.faqs && Array.isArray(product.faqs) && product.faqs.length > 0) {
      return product.faqs;
    }
    return [
      {
        question: "How does the garment fit?",
        answer: "This piece features a relaxed tailored silhouette that fits true to size. For an oversized drape, consider sizing up one size.",
      },
      {
        question: "What is your return & exchange policy?",
        answer: "We offer complimentary 30-day returns and exchanges on all unworn items with original tags intact.",
      },
      {
        question: "How fast is shipping & delivery?",
        answer: "Orders ship within 24 business hours. Standard delivery takes 3–5 business days with live tracking provided.",
      },
    ];
  }, [product]);

  const [faqs, setFaqs] = useState(initialFaqs);

  // Specs Handlers
  const handleAddSpec = (key = "", value = "") => {
    setSpecs((prev) => [...prev, { key, value }]);
  };
  const handleUpdateSpec = (idx, field, val) => {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };
  const handleRemoveSpec = (idx) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  // FAQs Handlers
  const handleAddFaq = (question = "", answer = "") => {
    setFaqs((prev) => [...prev, { question, answer }]);
  };
  const handleUpdateFaq = (idx, field, val) => {
    setFaqs((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)));
  };
  const handleRemoveFaq = (idx) => {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  };

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);

    const uploadedUrls = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "products");

        const res = await fetch("/admin/api/upload", {
          method: "POST",
          headers: { "X-CSRF-TOKEN": csrfToken() },
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          // Fallback to base64 data URL
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(base64);
        }
      } catch (err) {
        // Fallback to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(base64);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded!`);
    }
    setIsUploadingImage(false);
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      toast.error("Please enter a valid image URL (e.g. https://.../photo.jpg)");
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput("");
    setShowUrlInput(false);
    toast.success("Image URL added to gallery!");
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.info("Image removed");
  };

  const handleMakePrimary = (indexToPrimary) => {
    setImages((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
    toast.success("Set as primary cover image!");
  };

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
    const price = Number(form.price) || 0;
    const cost = Number(form.costPerItem) || 0;
    const profit = price - cost;
    const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : "0.0";
    return { profit: profit.toFixed(2), margin };
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price) {
      toast.error("Product title and price are required.");
      return;
    }
    setIsSaving(true);
    try {
      const selectedCategoryObj = serverCategories.find((c) => c.name === form.category || c.id === Number(form.category)) || serverCategories[0];
      const categoryId = selectedCategoryObj?.id || (serverCategories[0]?.id ?? 1);

      const endpoint = isEditing ? `/admin/products/${product.id}` : "/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({
          name: form.title,
          description: form.description || form.title,
          price: parseFloat(form.price),
          original_price: form.comparePrice ? parseFloat(form.comparePrice) : null,
          compare_at_price: form.comparePrice ? parseFloat(form.comparePrice) : null,
          stock_quantity: parseInt(form.inventoryQty, 10) || 10,
          weight_kg: form.weightKg ? parseFloat(form.weightKg) : 0,
          category: form.category,
          category_id: categoryId,
          sku: form.sku || null,
          is_active: form.status === "Active",
          material: form.material || null,
          available_colors: variants.find((v) => v.name.toLowerCase() === "color")?.values || [],
          available_sizes: variants.find((v) => v.name.toLowerCase() === "size")?.values || [],
          specs: specs.filter((s) => s.key && s.key.trim() && s.value && s.value.trim()),
          faqs: faqs.filter((f) => f.question && f.question.trim() && f.answer && f.answer.trim()),
          image: images[0] || null,
          gallery: images,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(isEditing ? "Product updated successfully!" : "Product published to catalog!", {
          description: `"${form.title}" is now saved in the store catalog.`,
        });
        navigate("/admin/products");
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(" ") : data.message;
        toast.error(errorMsg || "Failed to save product. Please check form values.");
      }
    } catch (err) {
      console.error("Save product error:", err);
      toast.error("Failed to save product. Please check your network connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const profitData = calcMargin();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {isEditing ? `Edit Product: ${product.name}` : "Create New Product"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? "Modify product attributes, pricing, and media." : "Fill in all details then publish to your storefront."}
            </p>
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Product Media Gallery</h2>
                <p className="text-xs text-slate-500">{images.length} image(s) attached • First image is primary cover</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LinkIcon className="size-3 text-slate-400" />
                  <span>{showUrlInput ? "Hide URL Input" : "Add Image URL"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  <span>{isUploadingImage ? "Uploading..." : "Browse Files"}</span>
                </button>
              </div>
            </div>

            {/* Hidden Real File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Add via URL bar */}
            {showUrlInput && (
              <div className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50/50 p-3 animate-in fade-in">
                <LinkIcon className="size-4 text-violet-600 shrink-0" />
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImageUrl())}
                  placeholder="Paste direct image link (e.g. https://images.unsplash.com/...)"
                  className="flex-1 bg-white h-9 rounded-xl border border-violet-200 px-3 text-xs focus:outline-none focus:border-violet-600"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="h-9 px-3 rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-700 transition-colors"
                >
                  Add Image
                </button>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-violet-600 bg-violet-50/60 scale-[0.99]"
                  : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-400",
              )}
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-white border border-slate-200 shadow-2xs">
                {isUploadingImage ? (
                  <Loader2 className="size-6 text-violet-600 animate-spin" />
                ) : (
                  <Upload className="size-6 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploadingImage ? "Uploading your files to store server..." : "Drag & drop images here or click to browse"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, SVG up to 20MB per photo</p>
              </div>
            </div>

            {/* Uploaded Gallery Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "group relative rounded-2xl border overflow-hidden bg-slate-100 aspect-square shadow-2xs transition-all",
                        idx === 0 ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200"
                      )}
                    >
                      <img
                        src={img}
                        alt={`Product ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Primary Cover Badge */}
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 rounded-md bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 shadow-xs flex items-center gap-1">
                          <Star className="size-2.5 fill-amber-400 text-amber-400" /> Cover
                        </span>
                      )}

                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                            className="grid size-7 place-items-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                            title="Delete image"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMakePrimary(idx); }}
                            className="w-full h-7 rounded-lg bg-white/90 text-slate-900 hover:bg-white text-[10px] font-bold transition-colors shadow-xs"
                          >
                            Set as Cover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400">Tip: The first image is used across the catalog grid, search results, and checkout cart.</p>
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
              <div className="flex flex-wrap gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Stock (On Hand)</label>
                  <input
                    type="number"
                    value={form.inventoryQty}
                    onChange={(e) => setField("inventoryQty", e.target.value)}
                    placeholder="0"
                    className="mt-1 h-11 w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.weightKg}
                    onChange={(e) => setField("weightKg", e.target.value)}
                    placeholder="e.g. 0.750"
                    className="mt-1 h-11 w-36 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
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
                className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Variant
              </button>
            </div>
          </div>

          {/* Full Specifications Builder */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Technical Specifications & Craft Details</h2>
                <p className="text-xs text-slate-500">Key attributes displayed in the product specifications tab</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddSpec("", "")}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="size-3" /> Add Spec
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick presets:</span>
              {[
                { k: "Material Composition", v: "100% Mongolian Cashmere" },
                { k: "Origin & Heritage", v: "Ulaanbaatar, Mongolia" },
                { k: "Dimensions & Fit", v: "Relaxed tailored fit" },
                { k: "Weight & Gauge", v: "420 GSM • 7-Gauge Heavy Rib" },
                { k: "Warranty", v: "2-Year Craftsmanship Guarantee" },
                { k: "Care Instructions", v: "Professional dry clean or hand wash cold" },
              ].map((preset) => (
                <button
                  key={preset.k}
                  type="button"
                  onClick={() => handleAddSpec(preset.k, preset.v)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  + {preset.k}
                </button>
              ))}
            </div>

            {/* Specs Rows */}
            <div className="space-y-3">
              {specs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No specifications added yet. Click <strong>+ Add Spec</strong> or select a quick preset above.
                </div>
              ) : (
                specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpec(idx, "key", e.target.value)}
                      placeholder="Spec Name (e.g. Material)"
                      className="w-1/3 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:border-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                      placeholder="Spec Detail / Value (e.g. 100% Grade-A Cashmere)"
                      className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="grid size-8 place-items-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove specification"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Common Questions & FAQs Builder */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Common Questions (Product FAQs)</h2>
                <p className="text-xs text-slate-500">Customer questions & answers shown on this product's page</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddFaq("", "")}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="size-3" /> Add FAQ
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick presets:</span>
              {[
                { q: "How does the sizing fit?", a: "This garment features a relaxed, tailored silhouette that fits true to size. Size up for an oversized look." },
                { q: "What is your return policy?", a: "We offer complimentary 30-day returns and exchanges on all unworn items with original tags." },
                { q: "How fast is delivery?", a: "Orders dispatch within 24 hours. Complimentary standard delivery arrives in 3–5 business days." },
              ].map((preset) => (
                <button
                  key={preset.q}
                  type="button"
                  onClick={() => handleAddFaq(preset.q, preset.a)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  + {preset.q.slice(0, 24)}...
                </button>
              ))}
            </div>

            {/* FAQs List */}
            <div className="space-y-3">
              {faqs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No FAQs added yet. Click <strong>+ Add FAQ</strong> or select a preset above.
                </div>
              ) : (
                faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <HelpCircle className="size-3.5 text-violet-600" /> Question #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="grid size-7 place-items-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                      placeholder="e.g. How do I clean and store this item?"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                      placeholder="Provide a clear, helpful answer for shoppers..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 focus:border-slate-900 focus:outline-none resize-none"
                    />
                  </div>
                ))
              )}
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
                {serverCategories.length > 0
                  ? serverCategories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  : CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
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

AdminProductCreatePage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductCreatePage;
