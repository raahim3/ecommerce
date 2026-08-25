import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { Reveal } from "./reveal";

export function SocialGallery() {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const images = settings.socialGalleryImages || [];
  const [activeIndex, setActiveIndex] = useState(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  return (
    <section className="py-14 lg:py-20">
      <div className="shell">
        <Reveal className="text-center">
          <p className="eyebrow">{settings.socialEyebrow || "Follow the journey"}</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{settings.socialTitle || "@atelier"}</h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {images.map((image, i) => (
            <Reveal key={image.url || i} delay={i * 60}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image: ${image.alt || "Gallery image"}`}
                className="group relative block overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={image.url}
                  alt={image.alt || "Gallery image"}
                  width={900}
                  height={1100}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
                <span className="absolute inset-0 grid place-items-center bg-ink/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <Maximize2 className="size-6 text-ink-foreground" strokeWidth={1.5} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      {activeImage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4" role="dialog" aria-modal="true" aria-label="Image preview">
          <button type="button" onClick={() => setActiveIndex(null)} aria-label="Close image preview" className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="size-5" />
          </button>
          <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} aria-label="Previous image" className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-8">
            <ArrowLeft className="size-5" />
          </button>
          <img src={activeImage.url} alt={activeImage.alt || "Gallery image"} className="max-h-[88vh] max-w-[90vw] object-contain" />
          <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} aria-label="Next image" className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-8">
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}
    </section>
  );
}
