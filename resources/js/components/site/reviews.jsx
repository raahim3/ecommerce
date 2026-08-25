import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "./reveal";

export function Reviews({ items = [] }) {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((n) => (n + 1) % Math.max(items.length, 1)), 6000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <section className="py-14 lg:py-20">
      <div className="shell">
        <SectionHeading eyebrow={settings.reviewsEyebrow || "Loved by thousands"} title={settings.reviewsTitle || "Reviews that keep us honest."} />

        <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-6">
          {items.map((item, i) => (
            <Reveal key={item.id || item.name} delay={i * 90}>
              <figure
                className={cn(
                  "flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all duration-500",
                  active === i ? "border-foreground/15 shadow-soft" : "shadow-none",
                )}
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="mt-5 grow text-[17px] leading-relaxed font-medium">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2 text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <BadgeCheck className="size-4 text-accent" strokeWidth={1.7} />
                    {item.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id || item.name}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Highlight review from ${item.name}`}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                active === i ? "w-8 bg-foreground" : "w-4 bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
