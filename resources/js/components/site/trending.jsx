import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { products as staticProducts } from "@/lib/shop-data";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { Reveal, SectionHeading } from "./reveal";

export function Trending({ items }) {
  const scroller = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const displayProducts = (items && items.length > 0) ? items : staticProducts.slice(0, 6);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="trending" className="bg-surface py-14 lg:py-20">
      <div className="shell">
        <SectionHeading
          eyebrow="Trending now"
          title="Products everyone is talking about."
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label="Previous products"
                className={cn(
                  "grid size-11 place-items-center rounded-full border border-border transition-all duration-300 hover:border-foreground/40 active:scale-95",
                  atStart && "opacity-35",
                )}
              >
                <ArrowLeft className="size-4" strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label="Next products"
                className={cn(
                  "grid size-11 place-items-center rounded-full border border-border transition-all duration-300 hover:border-foreground/40 active:scale-95",
                  atEnd && "opacity-35",
                )}
              >
                <ArrowRight className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          }
        />

        <Reveal delay={60}>
          <div
            ref={scroller}
            onScroll={sync}
            className="no-scrollbar mt-8 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8 lg:gap-6"
          >
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
