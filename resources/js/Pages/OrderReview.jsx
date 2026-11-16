import { useEffect, useRef, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { CheckCircle2, Plus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/shop-data";

export function OrderReviewPage({ reviewToken, order, items = [], reviewProducts = [] }) {
  const { app_settings: appSettings = {} } = usePage().props;
  const storeName = appSettings.general?.storeName || "Store";
  const [forms, setForms] = useState(() => Object.fromEntries(reviewProducts.map((item) => [
    item.product_id,
    { rating: 5, title: "", comment: "", attachments: [] },
  ])));
  const formsRef = useRef(forms);
  formsRef.current = forms;
  const [reviewedProducts, setReviewedProducts] = useState(() => Object.fromEntries(
    reviewProducts.map((item) => [item.product_id, item.reviewed])
  ));
  const [submittingProducts, setSubmittingProducts] = useState({});

  useEffect(() => () => {
    Object.values(formsRef.current).forEach((form) => {
      form.attachments.forEach(({ preview }) => URL.revokeObjectURL(preview));
    });
  }, []);

  const updateForm = (productId, field, value) => {
    setForms((current) => ({
      ...current,
      [productId]: { ...current[productId], [field]: value },
    }));
  };

  const handleAttachmentUpload = (productId, event) => {
    const files = Array.from(event.target.files || []);
    const allowedFiles = files.filter((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name} is not a supported image.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5 MB limit.`);
        return false;
      }
      return true;
    });
    const currentAttachments = forms[productId].attachments;
    const availableSlots = Math.max(0, 3 - currentAttachments.length);
    if (allowedFiles.length > availableSlots) toast.error("You can attach up to 3 photos.");
    const newAttachments = allowedFiles.slice(0, availableSlots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    updateForm(productId, "attachments", [...currentAttachments, ...newAttachments]);
    event.target.value = "";
  };

  const removeAttachment = (productId, attachment) => {
    URL.revokeObjectURL(attachment.preview);
    updateForm(
      productId,
      "attachments",
      forms[productId].attachments.filter((item) => item !== attachment)
    );
  };

  const submitReview = async (event, productId) => {
    event.preventDefault();
    setSubmittingProducts((current) => ({ ...current, [productId]: true }));

    try {
      const formData = new FormData();
      formData.append("product_id", String(productId));
      formData.append("rating", String(forms[productId].rating));
      formData.append("title", forms[productId].title);
      formData.append("comment", forms[productId].comment);
      forms[productId].attachments.forEach(({ file }) => formData.append("attachments[]", file));

      const response = await fetch(`/order-review/${encodeURIComponent(reviewToken)}/reviews`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: formData,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const validationMessage = Object.values(result.errors || {}).flat()[0];
        throw new Error(result.message || validationMessage || "Unable to submit your review.");
      }

      setReviewedProducts((current) => ({ ...current, [productId]: true }));
      forms[productId].attachments.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setForms((current) => ({
        ...current,
        [productId]: { ...current[productId], attachments: [] },
      }));
      toast.success(result.message || "Your review was submitted.");
    } catch (error) {
      toast.error(error.message || "Could not submit your review. Please try again.");
    } finally {
      setSubmittingProducts((current) => ({ ...current, [productId]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:py-12">
      <Head>
        <title>{`Review Order ${order.order_number} | ${storeName}`}</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>

      <div className="mx-auto max-w-3xl">
        <header className="mb-6 text-center">
          <p className="text-sm font-extrabold tracking-wide text-slate-900">{storeName}</p>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">How was your order?</h1>
          <p className="mt-2 text-sm text-slate-500">Share your experience with the products you received.</p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order summary</p>
              <h2 className="mt-1 text-lg font-extrabold">#{order.order_number}</h2>
              {order.placed_at && <p className="mt-1 text-xs text-slate-500">{new Date(order.placed_at).toLocaleDateString()}</p>}
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Delivered</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-3 py-4">
                {item.image ? (
                  <img src={item.image} alt="" className="size-14 rounded-xl bg-slate-100 object-cover" />
                ) : (
                  <div className="size-14 rounded-xl bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[item.color, item.size].filter(Boolean).join(" · ")}
                    {[item.color, item.size].filter(Boolean).length > 0 ? " · " : ""}
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
            <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span></div>
            {order.tax > 0 && <div className="flex justify-between text-slate-500"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
            <div className="flex justify-between border-t border-slate-100 pt-3 font-extrabold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-lg font-extrabold">Review your products</h2>
          {reviewProducts.map((item) => (
            <article key={item.product_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt="" className="size-12 rounded-lg bg-slate-100 object-cover" />
                ) : (
                  <div className="size-12 rounded-lg bg-slate-100" />
                )}
                <div>
                  <h3 className="text-sm font-extrabold">{item.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">Quantity: {item.quantity}</p>
                </div>
              </div>

              {reviewedProducts[item.product_id] ? (
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="size-4 shrink-0" />
                  This product has already been reviewed. Thank you!
                </p>
              ) : (
                <form onSubmit={(event) => submitReview(event, item.product_id)} className="mt-5 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-700">Your rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                          onClick={() => updateForm(item.product_id, "rating", rating)}
                          className="rounded-md p-1"
                        >
                          <Star className={`size-6 ${rating <= forms[item.product_id].rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    value={forms[item.product_id].title}
                    onChange={(event) => updateForm(item.product_id, "title", event.target.value)}
                    maxLength={150}
                    placeholder="Review title (optional)"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
                  />
                  <textarea
                    required
                    value={forms[item.product_id].comment}
                    onChange={(event) => updateForm(item.product_id, "comment", event.target.value)}
                    maxLength={5000}
                    rows={4}
                    placeholder="Tell us what you think about this product"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                  />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-slate-700">Photos <span className="font-normal text-slate-500">(optional, up to 3)</span></p>
                      <label className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-xs font-bold text-slate-600 ${forms[item.product_id].attachments.length < 3 && !submittingProducts[item.product_id] ? "cursor-pointer hover:border-slate-500 hover:text-slate-900" : "cursor-not-allowed opacity-50"}`}>
                        <Plus className="size-3.5" />
                        Add photos
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          disabled={forms[item.product_id].attachments.length >= 3 || submittingProducts[item.product_id]}
                          onChange={(event) => handleAttachmentUpload(item.product_id, event)}
                        />
                      </label>
                    </div>
                    {forms[item.product_id].attachments.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {forms[item.product_id].attachments.map((attachment, index) => (
                          <div key={`${attachment.file.name}-${index}`} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <img src={attachment.preview} alt={`Review photo ${index + 1}`} className="aspect-square w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeAttachment(item.product_id, attachment)}
                              disabled={submittingProducts[item.product_id]}
                              aria-label={`Remove review photo ${index + 1}`}
                              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-900/80 text-white disabled:opacity-50"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">JPEG, PNG, or WebP. Maximum 5 MB per photo.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingProducts[item.product_id]}
                    className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingProducts[item.product_id] ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              )}
            </article>
          ))}
          {reviewProducts.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              There are no products available to review in this order.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

OrderReviewPage.layout = (page) => page;

export default OrderReviewPage;
