import { useEffect, useState } from "react";
import { filters, products } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Reveal, SectionHeading } from "./reveal";

export function BestSellers() {
  const [active, setActive] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active === "All") return;
    setLoading(true);
    const id = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(id);
  }, [active]);

  const visible = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="favorites" className="py-14 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Customer favorites"
          title="The pieces that keep selling out."
        />

        <Reveal
          delay={60}
          className="no-scrollbar mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 md:-mx-8 md:px-8"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              aria-pressed={active === filter}
              className={cn(
                "h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-all duration-300",
                active === filter
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {filter}
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
              onClick={() => setActive("All")}
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
