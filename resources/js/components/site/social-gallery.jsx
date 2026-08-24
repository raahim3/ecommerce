import { FaceAngry } from "lucide-react";
import { socialImages } from "@/lib/shop-data";
import { Reveal } from "./reveal";

export function SocialGallery() {
  return (
    <section className="py-14 lg:py-20">
      <div className="shell">
        <Reveal className="text-center">
          <p className="eyebrow">Follow the journey</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">@atelier</h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {socialImages.map((image, i) => (
            <Reveal key={image.alt} delay={i * 60}>
              <a
                href="#top"
                aria-label={`View post: ${image.alt}`}
                className="group relative block overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={900}
                  height={1100}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                />
                <span className="absolute inset-0 grid place-items-center bg-ink/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <FaceAngry className="size-6 text-ink-foreground" strokeWidth={1.5} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
