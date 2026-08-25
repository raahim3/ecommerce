import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, Star } from "lucide-react";
import heroImageFallback from "@/assets/hero.jpg";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/shop-data";

export function Hero() {
  const { app_settings: appSettings = {}, heroProduct = null } = usePage().props;
  const settings = appSettings.homepage || {};
  const editorProduct = heroProduct;
  const headline = String(settings.heroTitle || "Discover\nWhat's\nNext.").split("\n").filter(Boolean);
  const heroImage = settings.heroImage || editorProduct?.image || editorProduct?.images?.[0]?.image_url || heroImageFallback;
  const [ready, setReady] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    const onScroll = () => setOffset(Math.min(window.scrollY, 700));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="top" className="relative overflow-hidden pt-20 lg:pt-24">
      <div className="shell grid items-center gap-8 pt-6 pb-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12 lg:pt-10 lg:pb-16">
        <div className="min-w-0">
          <p
            className={cn(
              "eyebrow transition-all duration-700",
              ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            {settings.heroEyebrow || "New Season / 2026 Collection"}
          </p>

          <h1 className="mt-4 text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.94] font-extrabold">
            {headline.map((word, i) => (
              <span key={word} className="block overflow-hidden">
                <span
                  className="block transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transitionDelay: `${120 + i * 110}ms`,
                    transform: ready ? "none" : "translateY(105%)",
                    opacity: ready ? 1 : 0,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p
            className={cn(
              "mt-4 max-w-md text-base text-muted-foreground transition-all delay-500 duration-700 sm:text-lg",
              ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            {settings.heroDescription || "Curated essentials designed for modern living — made in small runs, built to outlast the season."}
          </p>

          <div
            className={cn(
              "mt-7 flex flex-col gap-3 transition-all delay-[620ms] duration-700 sm:flex-row",
              ready ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
          >
            <Link
              to={settings.heroPrimaryUrl || "/shop"}
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
            >
              {settings.heroPrimaryLabel || "Shop Collection"}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
            <Link
              to={settings.heroSecondaryUrl || "/shop?sort=newest"}
              className="inline-flex h-13 items-center justify-center rounded-full border border-border px-8 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/40 hover:bg-foreground/[0.03]"
            >
              {settings.heroSecondaryLabel || "Explore New Arrivals"}
            </Link>
          </div>

          <div
            className={cn(
              "mt-8 flex items-center gap-6 transition-opacity delay-[800ms] duration-700",
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">4.9</span> from 12,400+ reviews
            </p>
          </div>
        </div>

        <div className="relative min-w-0">
          <div
            className="relative max-h-[52vh] overflow-hidden rounded-3xl bg-muted lg:max-h-[640px]"
            style={{ transform: `translateY(${offset * -0.04}px)` }}
          >
            <img
              src={heroImage}
              alt={settings.heroImageAlt || "Model wearing an off-white oversized wool coat against a soft concrete wall"}
              width={1200}
              height={1504}
              fetchPriority="high"
              className={cn(
                "aspect-4/5 w-full object-cover transition-all duration-[1400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] lg:aspect-4/5",
                ready ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-md",
              )}
              style={{ transform: `scale(${1 + offset * 0.00006})` }}
            />
          </div>

          <div
            className={cn(
              "glass animate-float absolute bottom-4 -left-2 rounded-2xl px-5 py-4 transition-all delay-[900ms] duration-700 sm:left-6",
              ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
          >
            <p className="eyebrow">Editor's pick</p>
            <p className="mt-1 text-sm font-semibold">{editorProduct?.name || "Latest product"}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPrice(editorProduct?.price || 0)} <span className="ml-1 text-accent">{editorProduct?.stock_quantity > 0 ? "In stock" : "Out of stock"}</span>
            </p>
          </div>

          <div
            className={cn(
              "glass absolute top-4 -right-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all delay-[1000ms] duration-700 sm:right-6",
              ready ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
            )}
          >
            <span className="mr-2 inline-block size-2 rounded-full bg-accent align-middle" />
            {settings.heroBadge || "Just dropped"}
          </div>
        </div>
      </div>

      <div className="shell hidden pb-8 lg:block">
        <div className="flex items-center gap-4">
          <span className="relative h-12 w-px overflow-hidden bg-border">
            <span className="animate-scroll-hint absolute inset-x-0 h-4 bg-accent" />
          </span>
          <span className="eyebrow">Scroll</span>
        </div>
      </div>
    </section>
  );
}
