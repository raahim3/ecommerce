import { Link } from "@inertiajs/react";
import { ArrowUpRight } from "lucide-react";
import { categories as staticCategories } from "@/lib/shop-data";
import { Reveal, SectionHeading } from "./reveal";

export function Categories({ items }) {
  const displayCategories = (items && items.length > 0)
    ? items.filter((c) => c.name !== "All Products" && c.slug !== "all")
    : staticCategories.filter((c) => c.name !== "All Products");

  return (
    <section id="shop" className="py-14 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Shop by category"
          title="Everything, carefully edited."
          subtitle="Four departments, one standard of quality."
          action={
            <Link href="/shop" className="link-underline text-sm font-semibold">
              View all collections
            </Link>
          }
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {displayCategories.map((cat, i) => (
            <Reveal key={cat.name || cat.id} delay={i * 90}>
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