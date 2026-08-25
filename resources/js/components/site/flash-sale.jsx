import { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import saleImageFallback from "@/assets/sale.jpg";
import { Reveal } from "./reveal";

function useCountdown(hours) {
  const duration = 1000 * 60 * 60 * hours;
  const [remaining, setRemaining] = useState(duration);
  useEffect(() => {
    const end = Date.now() + duration;
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [duration]);
  const total = Math.floor(remaining / 1000);
  return [
    { label: "Days", value: Math.floor(total / 86400) },
    { label: "Hours", value: Math.floor((total % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((total % 3600) / 60) },
    { label: "Seconds", value: total % 60 },
  ];
}

export function FlashSale() {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const title = String(settings.flashSaleTitle || "The Essentials\nSale").split("\n").filter(Boolean);
  const units = useCountdown(Number(settings.flashSaleDurationHours) || 48);

  return (
    <section id="sale" className="px-5 py-4 md:px-8 lg:py-6">
      <div className="relative mx-auto max-w-[84rem] overflow-hidden rounded-3xl bg-ink text-ink-foreground">
          <img
          src={settings.flashSaleImage || saleImageFallback}
          alt=""
          aria-hidden="true"
          width={1408}
          height={912}
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <span className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/25" />
        <span className="animate-float absolute -top-20 -left-16 size-72 rounded-full bg-accent/25 blur-3xl" />
        <span className="absolute -right-10 -bottom-10 size-64 rounded-full bg-accent-soft/20 blur-3xl" />

        <div className="relative grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_auto] lg:items-end lg:px-16 lg:py-16">
          <Reveal className="min-w-0">
            <p className="eyebrow text-ink-foreground/60">{settings.flashSaleEyebrow || "Up to 40% off"}</p>
            <h2 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-extrabold">
              {title.map((line) => <span key={line} className="block">{line}</span>)}
            </h2>
            <p className="mt-5 max-w-md text-ink-foreground/70">
              {settings.flashSaleDescription || "Two days only. Our most-loved pieces, marked down across every department."}
            </p>
            <Link
              to={settings.flashSaleActionUrl || "/shop?sale=true"}
              className="group mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              {settings.flashSaleActionLabel || "Shop the sale"}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          </Reveal>

          <Reveal delay={120} className="min-w-0">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {units.map((unit) => (
                <div
                  key={unit.label}
                  className="rounded-2xl border border-ink-foreground/12 bg-ink-foreground/6 px-2 py-4 text-center backdrop-blur-sm sm:px-5 sm:py-6"
                >
                  <div className="text-2xl font-extrabold tabular-nums sm:text-4xl">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="mt-1.5 text-[10px] tracking-[0.2em] text-ink-foreground/55 uppercase">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
