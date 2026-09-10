import { useMemo, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  Check,
  X,
  ImageIcon,
  Upload,
  ChevronDown,
  Sparkles,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/layouts/admin-layout";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "hidden", label: "Hidden" },
  { value: "rejected", label: "Rejected" },
];

const EMPTY_FORM = {
  product_id: "",
  author_name: "",
  rating: 5,
  title: "",
  comment: "",
  status: "approved",
  attachments: [],
};

export function AdminReviewsPage({ reviews = [], products = [], filters = {} }) {
  const { app_settings } = usePage().props;
  const [searchQuery, setSearchQuery] = useState(filters.search ?? "");
  const [statusFilter, setStatusFilter] = useState(filters.status ?? "all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";

  const normalizedReviews = useMemo(() => {
    return (reviews || []).map((review) => ({
      ...review,
      statusLabel: review.status === "approved" ? "Approved" : review.status === "pending" ? "Pending" : review.status === "hidden" ? "Hidden" : "Rejected",
      attachments: Array.isArray(review.attachments) ? review.attachments : [],
    }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return normalizedReviews.filter((review) => {
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        review.author_name?.toLowerCase().includes(search) ||
        review.title?.toLowerCase().includes(search) ||
        review.comment?.toLowerCase().includes(search) ||
        review.product?.name?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [normalizedReviews, searchQuery, statusFilter]);

  const applyFilters = (next = {}) => {
    router.get(
      "/admin/reviews",
      {
        search: next.search ?? (searchQuery || undefined),
        status: next.status ?? (statusFilter === "all" ? undefined : statusFilter),
      },
      { preserveState: true, preserveScroll: true }
    );
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingReview(null);
    setPreviewImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setForm({
      product_id: review.product_id || "",
      author_name: review.author_name || "",
      rating: review.rating || 5,
      title: review.title || "",
      comment: review.comment || "",
      status: review.status || "approved",
      attachments: Array.isArray(review.attachments) ? review.attachments : [],
    });
    setPreviewImages(Array.isArray(review.attachments) ? review.attachments : []);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setIsUploading(true);

    try {
      const uploaded = [];
      for (const file of files) {
        const data = new FormData();
        data.append("image", file);
        data.append("folder", "reviews");

        const response = await fetch("/admin/api/upload", {
          method: "POST",
          headers: { "X-CSRF-TOKEN": csrfToken() },
          body: data,
        });

        const result = await response.json();
        if (response.ok && result.success && result.url) {
          uploaded.push(result.url);
        }
      }

      if (uploaded.length > 0) {
        setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), ...uploaded] }));
        setPreviewImages((prev) => [...prev, ...uploaded]);
        toast.success(`${uploaded.length} attachment(s) uploaded.`);
      }
    } catch (error) {
      toast.error("One or more attachments failed to upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (attachmentUrl) => {
    setForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((item) => item !== attachmentUrl),
    }));
    setPreviewImages((prev) => prev.filter((item) => item !== attachmentUrl));
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!form.product_id || !form.author_name.trim() || !form.comment.trim()) {
      toast.error("Please select a product, enter author name, and add review comments.");
      return;
    }

    const payload = {
      ...form,
      attachments: form.attachments || [],
    };

    try {
      const endpoint = editingReview ? `/admin/reviews/${editingReview.id}` : "/admin/reviews";
      const method = editingReview ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save review.");
      }

      toast.success(editingReview ? "Review updated." : "Review created.");
      router.reload({ only: ["reviews"] });
      closeModal();
    } catch (error) {
      toast.error(error.message || "Failed to save review.");
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      const response = await fetch(`/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken() },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete review.");
      }
      toast.success("Review deleted.");
      router.reload({ only: ["reviews"] });
    } catch (error) {
      toast.error(error.message || "Failed to delete review.");
    }
  };

  const toggleReviewStatus = async (reviewId, nextStatus) => {
    try {
      const response = await fetch(`/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update review status.");
      }
      toast.success("Review status updated.");
      router.reload({ only: ["reviews"] });
    } catch (error) {
      toast.error(error.message || "Failed to update review status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">Manage customer feedback, visibility, and media attachments.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Plus className="size-4" /> Add Review
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters({ search: e.currentTarget.value });
              }}
              placeholder="Search reviews, products, or customers..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs focus:border-slate-900 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              const next = e.target.value;
              setStatusFilter(next);
              applyFilters({ status: next });
            }}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-slate-900 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4">Attachments</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900">{review.author_name}</p>
                      <p className="text-[11px] text-slate-500">{review.title || "Customer review"}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <Link href={`/product/${review.product?.slug || review.product_id}`} target="_blank" className="font-semibold text-slate-800 hover:text-slate-900 underline-offset-2 hover:underline">
                        {review.product?.name || `Product #${review.product_id}`}
                      </Link>
                      <p className="text-[11px] text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((value) => (
                        <Star
                          key={value}
                          className={cn("size-3.5", value <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={review.status}
                      onChange={(e) => toggleReviewStatus(review.id, e.target.value)}
                      className={cn(
                        "h-9 rounded-xl border px-2.5 text-[11px] font-bold focus:outline-none",
                        review.status === "approved" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                        review.status === "pending" && "border-amber-200 bg-amber-50 text-amber-700",
                        review.status === "hidden" && "border-sky-200 bg-sky-50 text-sky-700",
                        review.status === "rejected" && "border-red-200 bg-red-50 text-red-700"
                      )}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    {review.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {review.attachments.slice(0, 3).map((attachment, index) => (
                          <a key={`${attachment}-${index}`} href={attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100">
                            <ImageIcon className="size-3" /> {index + 1}
                          </a>
                        ))}
                        {review.attachments.length > 3 && <span className="text-[10px] font-bold text-slate-500">+{review.attachments.length - 3} more</span>}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">No attachments</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(review)}
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        aria-label="Edit review"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        aria-label="Delete review"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="py-16 text-center">
              <Sparkles className="mx-auto size-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-500">No reviews found</p>
              <p className="mt-1 text-xs text-slate-400">Try a different search or create a review.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Review</p>
                <h2 className="text-xl font-extrabold text-slate-900">{editingReview ? "Edit review" : "Add review"}</h2>
              </div>
              <button type="button" onClick={closeModal} className="grid size-8 place-items-center rounded-full hover:bg-slate-100 text-slate-500">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product</label>
                  <select
                    value={form.product_id}
                    onChange={(e) => handleFieldChange("product_id", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:outline-none"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:outline-none"
                  >
                    {STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Author name</label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => handleFieldChange("author_name", e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rating</label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 h-11">
                    {[1,2,3,4,5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleFieldChange("rating", value)}
                        className="grid place-items-center"
                      >
                        <Star className={cn("size-4", value <= form.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => handleFieldChange("comment", e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attachments</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="size-3.5" /> {isUploading ? "Uploading..." : "Add attachment"}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadFiles}
                />

                {previewImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previewImages.map((attachment, index) => (
                      <div key={`${attachment}-${index}`} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img src={attachment} alt={`Attachment ${index + 1}`} className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment)}
                          className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-slate-900/80 text-white opacity-0 transition group-hover:opacity-100"
                          aria-label="Remove attachment"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
                  {editingReview ? "Save changes" : "Create review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

AdminReviewsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminReviewsPage;
