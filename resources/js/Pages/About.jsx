import { Link, usePage } from "@inertiajs/react";
import { Sparkles, ShieldCheck, Leaf, Globe, ArrowRight, Award, Compass, Heart } from "lucide-react";
import editorialImg from "@/assets/editorial.jpg";
import heroImg from "@/assets/hero.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catHome from "@/assets/cat-home.jpg";
import { SiteLayout } from "@/layouts/site-layout";

export function AboutPage() {
  const { props } = usePage();
  const content = props?.pageContent || {};
  if (content.body) {
    return (
      <main className="min-h-screen pb-24 pt-28 lg:pt-36">
        <div className="shell max-w-5xl">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/" className="hover:text-foreground">Home</Link><span>/</span><span className="font-semibold text-foreground">About</span></nav>
          <header className="grid items-end gap-8 border-b border-border pb-12 lg:grid-cols-[1fr_0.8fr]">
            <div><span className="eyebrow">{content.eyebrow || "About"}</span><h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">{content.title || "Our story"}</h1><p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{content.intro || "Discover what guides our work."}</p></div>
            {content.image && <img src={content.image} alt={content.title || "About Atelier"} className="aspect-4/3 w-full rounded-3xl object-cover" />}
          </header>
          <article className="prose prose-slate mx-auto mt-12 max-w-3xl" dangerouslySetInnerHTML={{ __html: content.body }} />
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen pb-24 pt-28 lg:pt-36">
      <div className="shell">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Our Story</span>
        </nav>

        {/* Hero Section */}
        <div className="border-b border-border pb-10 text-center max-w-3xl mx-auto">
          <span className="eyebrow">{content.eyebrow || "The Atelier Manifesto"}</span>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            {content.title || "Purity in form. Integrity in craft."}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {content.intro || "We exist to counter the culture of disposable trends. Every piece in our collection is conceived in Copenhagen, refined through artisanal European ateliers, and engineered to age gracefully over decades."}
          </p>
        </div>

        {/* 2-Column Editorial Story */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted shadow-sm">
              <img
              src={content.image || editorialImg}
              alt="Atelier workspace and design sketches"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6 lg:pl-6">
            <span className="eyebrow text-accent">Where it began</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              A refusal to compromise on materials.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.storyBody1 || "Founded in 2021 by a collective of industrial designers and textile purists, Atelier began with a single question: Why should modern luxury be so noisy, fragile, and marked up?"}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.storyBody2 || "We eliminated the traditional retail middlemen, licensing fees, and seasonal fashion calendars. By producing in controlled, limited runs with master makers across Italy, France, Japan, and Portugal, we deliver uncompromising grade-A quality directly to your doorstep."}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <h4 className="text-2xl font-extrabold text-foreground">{content.storyStat1Value || "100%"}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{content.storyStat1Label || "Direct-from-maker supply chain"}</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-foreground">{content.storyStat2Value || "Zero"}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{content.storyStat2Label || "Deadstock inventory landfills"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Craftsmanship */}
        <section className="mt-20">
          <div className="text-center max-w-xl mx-auto">
            <span className="eyebrow">{content.standardsEyebrow || "Our Standard"}</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {content.standardsTitle || "Four Unwavering Commitments"}
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Compass,
                title: "Material Sourcing",
                desc: "Certified Grade-A Mongolian cashmere, Tuscan vegetable-tanned leather, and Japanese beta-titanium wireframes.",
              },
              {
                icon: Award,
                title: "Small-Batch Runs",
                desc: "Manufactured strictly to demand. We produce fewer items with obsessive attention to stitching and tolerances.",
              },
              {
                icon: Leaf,
                title: "Eco Packaging",
                desc: "Every order arrives in 100% recycled unbleached kraft boxes printed exclusively with biodegradable soy inks.",
              },
              {
                icon: ShieldCheck,
                title: "2-Year Warranty",
                desc: "We stand behind every item we create with an unconditional two-year repair or replacement guarantee.",
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col justify-between hover:border-foreground/30 transition-colors"
              >
                <div>
                  <div className="grid size-10 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <pillar.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Ateliers Map Showcase */}
        <section className="mt-20 rounded-3xl border border-border/80 bg-surface p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-xl mx-auto">
            <span className="eyebrow">{content.footprintEyebrow || "Global Footprint"}</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {content.footprintTitle || "Where Our Makers Create"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {content.footprintDescription || "Partnering with generational workshops renowned for specific mastery."}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="rounded-2xl bg-muted/40 p-5 border border-border/60">
              <span className="text-accent font-extrabold text-[11px] uppercase">Biella, Italy</span>
              <h4 className="font-bold text-foreground mt-1 text-sm">Cashmere & Knitwear</h4>
              <p className="mt-1.5 text-muted-foreground leading-relaxed">
                Spun in family-run mills operating along the pristine alpine waters of Piedmont since 1948.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-5 border border-border/60">
              <span className="text-accent font-extrabold text-[11px] uppercase">Kyoto, Japan</span>
              <h4 className="font-bold text-foreground mt-1 text-sm">Ceramics & Diffusers</h4>
              <p className="mt-1.5 text-muted-foreground leading-relaxed">
                Hand-thrown organic stoneware ceramics and Hinoki wood oil distillations by master artisans.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-5 border border-border/60">
              <span className="text-accent font-extrabold text-[11px] uppercase">Porto, Portugal</span>
              <h4 className="font-bold text-foreground mt-1 text-sm">Footwear & Leather</h4>
              <p className="mt-1.5 text-muted-foreground leading-relaxed">
                Constructed on natural Margom rubber cup soles with double-stitched vegetable calfskins.
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-5 border border-border/60">
              <span className="text-accent font-extrabold text-[11px] uppercase">Geneva, Switzerland</span>
              <h4 className="font-bold text-foreground mt-1 text-sm">Horology & Crystals</h4>
              <p className="mt-1.5 text-muted-foreground leading-relaxed">
                Swiss quartz movement assembly and anti-reflective domed sapphire crystal fabrication.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Strip */}
        <div className="mt-16 rounded-3xl bg-ink p-8 sm:p-12 text-center text-ink-foreground relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {content.ctaTitle || "Experience the Atelier difference."}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-foreground/70 leading-relaxed">
              {content.ctaDescription || "Explore our current collection of audio, timepieces, knitwear, and lifestyle objects."}
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-xs font-bold text-ink hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
            >
              <span>{content.actionLabel || "Shop Current Collection"}</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

AboutPage.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default AboutPage;
