import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";

export function AdminPagination({ paginator }) {
  if (!paginator || paginator.last_page <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
      <span>Showing {paginator.from ?? 0}-{paginator.to ?? 0} of {paginator.total ?? 0}</span>
      <div className="flex items-center gap-1">
        {(paginator.links ?? []).map((link, index) => (
          <Link key={`${link.label}-${index}`} href={link.url || "#"} preserveScroll className={cn(
            "min-w-8 rounded-lg border px-2 py-1 text-center font-semibold",
            link.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:bg-slate-50",
            !link.url && "pointer-events-none opacity-40",
          )} dangerouslySetInnerHTML={{ __html: link.label }} />
        ))}
      </div>
    </div>
  );
}
