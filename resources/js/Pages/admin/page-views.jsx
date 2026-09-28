import { useState } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, Eye, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/layouts/admin-layout";

export function AdminPageViewsPage({ pages = [], totalViews = 0, trackedPages = 0 }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const resetPageViews = async () => {
    setIsResetting(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
      const response = await fetch("/admin/page-views/reset", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not reset page views.");
      }

      setShowResetConfirm(false);
      toast.success("All page view counts have been reset.");
      router.reload({ only: ["pages", "totalViews", "trackedPages"] });
    } catch (error) {
      toast.error(error.message || "Could not reset page views.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Page Views</h1>
          <p className="mt-1 text-xs text-slate-500">Public page traffic across your store.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          disabled={isResetting || totalViews === 0}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RotateCcw className="size-3.5" /> Reset Page Views
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Eye className="size-4" /> Total Views</div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{Number(totalViews).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><FileText className="size-4" /> Pages Tracked</div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{Number(trackedPages).toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="p-3 sm:p-4">Page</th>
                <th className="p-3 sm:p-4 text-right">Views</th>
                <th className="hidden p-4 text-right sm:table-cell">Last Viewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.page_key}>
                  <td className="p-3 font-semibold text-slate-800 sm:p-4">{page.page_name}</td>
                  <td className="p-3 text-right font-bold tabular-nums text-slate-900 sm:p-4">{Number(page.views).toLocaleString()}</td>
                  <td className="hidden p-4 text-right text-xs text-slate-500 sm:table-cell">
                    {page.last_viewed_at ? new Date(`${page.last_viewed_at}Z`).toLocaleString() : "Never"}
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan="3" className="p-10 text-center text-sm text-slate-500">No page views recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            aria-label="Close confirmation"
            disabled={isResetting}
            onClick={() => setShowResetConfirm(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-page-views-title"
            className="relative z-10 w-full max-w-md space-y-4 rounded-xl border border-red-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 id="reset-page-views-title" className="font-bold text-slate-900">Reset all page views?</h2>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  This will permanently set every tracked page view count to zero and clear its last-viewed time. This cannot be undone.
                </p>
              </div>
            </div>
            <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-800">
              You are about to reset {Number(totalViews).toLocaleString()} total views across {Number(trackedPages).toLocaleString()} pages.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetConfirm(false)}
                className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={resetPageViews}
                className="h-9 rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isResetting ? "Resetting..." : "Yes, reset all views"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

AdminPageViewsPage.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminPageViewsPage;