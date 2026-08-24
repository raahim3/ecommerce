import { ArrowRight } from "lucide-react";
import editorialImage from "@/assets/editorial.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { Reveal } from "./reveal";

export function Editorial() {
  const [ref, visible] = useReveal({ threshold: 0.25 });

  return (
    <section className="bg-surface py-14 lg:py-20">
      <div className="shell grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div ref={ref} className="media-reveal overflow-hidden rounded-3xl bg-muted" data-visible={visible}>
          <img
            src={editorialImage}
            alt="A calm minimal living room with a linen sofa and warm daylight"
            width={1104}
            height={1312}
            loading="lazy"
            className="aspect-4/5 w-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <Reveal>
            <p className="eyebrow">Our philosophy</p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.75rem)] leading-[1] font-extrabold">
              More than just shopping.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Thoughtfully selected products. Exceptional quality. Designed for the way you live —
              and made by people we know by name.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-6">
              {[
                ["120+", "Makers"],
                ["18", "Countries"],
                ["94%", "Repeat buyers"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-2xl font-extrabold sm:text-3xl">{value}</dt>
                  <dd className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={240}>
            <a
              href="#top"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <span className="link-underline">Our story</span>
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
