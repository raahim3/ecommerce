import { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { BadgeCheck, Star } from "lucide-react";
import { Reveal } from "./reveal";

export function Reviews({ items = [] }) {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const [active, setActive] = useState(0);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  useEffect(() => {
    if (safeItems.length <= 3) return;

    const id = setInterval(() => {
      setActive((current) => (current + 1) % Math.max(1, safeItems.length - 2));
    }, 5000);

    return () => clearInterval(id);
  }, [safeItems.length]);

  if (safeItems.length === 0) {
    return null;
  }

  const visibleItems = safeItems.slice(active, active + 3);
  if (visibleItems.length < 3 && safeItems.length >= 3) {
    visibleItems.push(...safeItems.slice(0, 3 - visibleItems.length));
  }

  return (
    <section className="bg-[#f5f3f0] py-12 lg:py-16">
      <div className="shell">
        <div className="mb-6 lg:mb-8">
          {settings.reviewsEyebrow ? <p className="eyebrow">{settings.reviewsEyebrow}</p> : null}
          <h2 className="mt-2 max-w-[18ch] text-[2.2rem] font-black leading-[0.98] tracking-[-0.07em] text-foreground sm:text-[2.9rem] lg:text-[4rem]">
            {settings.reviewsTitle || "Reviews that keep us honest."}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, index) => (
            <Reveal key={item.id || item.name || index} delay={index * 80}>
              <figure className="flex h-full min-h-[15rem] flex-col justify-between rounded-[1.5rem] border border-[#e5ddd9] bg-[#f9f8f6] p-5 shadow-[0_1px_0_rgba(15,15,15,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 lg:p-6">
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={`${item.id || item.name || index}-star-${starIndex}`}
                        className="size-3.5 fill-[#5363f8] text-[#5363f8]"
                      />
                    ))}
                  </div>

                  <blockquote className="mt-4 text-[1.05rem] leading-[1.45] font-medium text-foreground sm:text-[1.15rem] lg:text-[1.2rem]">
                    “{item.quote}”
                  </blockquote>
                </div>

                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-border/80 pt-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground sm:text-base">{item.name}</span>
                      {item.verified !== false ? (
                        <BadgeCheck className="size-4 shrink-0 text-[#5363f8]" strokeWidth={1.8} />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {safeItems.length > 3 ? (
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: Math.max(1, safeItems.length - 2) }).map((_, index) => (
              <button
                key={`review-dot-${index}`}
                type="button"
                aria-label={`Show review set ${index + 1}`}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === index ? "w-8 bg-foreground" : "w-2.5 bg-[#cfc5c0] hover:bg-[#a7a09c]"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
