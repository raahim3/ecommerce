import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Reveal, SectionHeading } from "./reveal";

export function BestSellers({ items, categories = [] }) {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const sourceProducts = items || [];
  const tabs = [{ id: "all", name: "All" }, ...categories];
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active === "all") return;
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(id);
  }, [active]);

  const visible = active === "all"
    ? sourceProducts
    : sourceProducts.filter((p) => Number(p.category_id || p.category?.id) === Number(active));

  return (
    <section id="favorites" className="py-14 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow={settings.bestSellerEyebrow || "Customer favorites"}
          title={settings.bestSellerTitle || "The pieces that keep selling out."}
          subtitle={settings.bestSellerSubtitle || undefined}
        />

        <Reveal
          delay={60}
          className="no-scrollbar mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8"
        >
          {tabs.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter.id)}
              aria-pressed={active === filter.id}
              className={cn(
                "h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-all duration-300",
                active === filter.id
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {filter.name}
            </button>
          ))}
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : visible.map((product, i) => (
                <Reveal key={`${active}-${product.id}`} delay={i * 70}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
        </div>

        {!loading && visible.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-lg font-semibold">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This edit is being restocked. Try another category.
            </p>
            <button
              type="button"
              onClick={() => setActive("all")}
              className="mt-6 h-11 rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:border-foreground/40"
            >
              View all products
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
