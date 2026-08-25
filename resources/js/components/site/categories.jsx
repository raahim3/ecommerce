import { useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./reveal";

export function Categories({ items }) {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const scroller = useRef(null);
  const selectedIds = (settings.selectedCategoryIds || []).map(Number);
  const allCategories = (items || []).filter((c) => c.name !== "All Products" && c.slug !== "all");
  const displayCategories = selectedIds.length > 0
    ? allCategories.filter((category) => selectedIds.includes(Number(category.id)))
    : allCategories;
  const isCarousel = displayCategories.length > 4;
  const scroll = (direction) => scroller.current?.scrollBy({ left: direction * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section id="shop" className="py-14 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow={settings.categoriesEyebrow || "Shop by category"}
          title={settings.categoriesTitle || "Everything, carefully edited."}
          subtitle={settings.categoriesSubtitle || "Four departments, one standard of quality."}
          action={
            <Link href={settings.categoriesActionUrl || "/shop"} className="link-underline text-sm font-semibold">
              {settings.categoriesActionLabel || "View all collections"}
            </Link>
          }
        />

        {isCarousel && (
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => scroll(-1)} aria-label="Previous categories" className="grid size-10 place-items-center rounded-full border border-border hover:border-foreground/40">
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Next categories" className="grid size-10 place-items-center rounded-full border border-border hover:border-foreground/40">
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        <div ref={scroller} className={cn("mt-8", isCarousel ? "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-5" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5")}>
          {displayCategories.map((cat, i) => (
            <Reveal key={cat.name || cat.id} delay={i * 90} className={isCarousel ? "w-[78%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-3.75rem)/4)]" : undefined}>
              <Link
                href={`/shop?category=${cat.slug || cat.name}`}
                className="group relative block overflow-hidden rounded-2xl bg-muted"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="aspect-3/4 w-full object-cover transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
                <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-ink-foreground transition-transform duration-500 group-hover:-translate-y-1">
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-bold">{cat.name}</span>
                    <span className="block text-xs text-ink-foreground/70">
                      {cat.products_count ?? cat.count ?? 0} products
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={1.8}
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}