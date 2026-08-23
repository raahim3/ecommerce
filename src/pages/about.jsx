import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Leaf, Globe, ArrowRight, Award, Compass, Heart } from "lucide-react";
import editorialImg from "@/assets/editorial.jpg";
import heroImg from "@/assets/hero.jpg";
import catFashion from "@/assets/cat-fashion.jpg";
import catHome from "@/assets/cat-home.jpg";

export function AboutPage() {
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
          <span className="eyebrow">The Atelier Manifesto</span>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            Purity in form. Integrity in craft.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            We exist to counter the culture of disposable trends. Every piece in our collection is conceived in Copenhagen, refined through artisanal European ateliers, and engineered to age gracefully over decades.
          </p>
        </div>

        {/* 2-Column Editorial Story */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted shadow-sm">
            <img
              src={editorialImg}
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
              Founded in 2021 by a collective of industrial designers and textile purists, Atelier began with a single question: Why should modern luxury be so noisy, fragile, and marked up?
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We eliminated the traditional retail middlemen, licensing fees, and seasonal fashion calendars. By producing in controlled, limited runs with master makers across Italy, France, Japan, and Portugal, we deliver uncompromising grade-A quality directly to your doorstep.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <h4 className="text-2xl font-extrabold text-foreground">100%</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Direct-from-maker supply chain</p>
              </div>
              <div>
                <h4 className="text-2xl font-extrabold text-foreground">Zero</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Deadstock inventory landfills</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Craftsmanship */}
        <section className="mt-20">
          <div className="text-center max-w-xl mx-auto">
            <span className="eyebrow">Our Standard</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Four Unwavering Commitments
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
            <span className="eyebrow">Global Footprint</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Where Our Makers Create
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Partnering with generational workshops renowned for specific mastery.
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
              Experience the Atelier difference.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-foreground/70 leading-relaxed">
              Explore our current collection of audio, timepieces, knitwear, and lifestyle objects.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-xs font-bold text-ink hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
            >
              <span>Shop Current Collection</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
