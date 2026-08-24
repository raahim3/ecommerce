import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "./reveal";

const BENEFITS = [
  { icon: Truck, title: "Free Shipping", text: "On orders over $100" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% secure checkout" },
  { icon: RotateCcw, title: "Easy Returns", text: "30-day hassle-free returns" },
  { icon: Headphones, title: "Premium Support", text: "We're here to help, always" },
];

export function Benefits() {
  return (
    <section className="border-y border-border py-10 lg:py-12">
      <div className="shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {BENEFITS.map((benefit, i) => (
          <Reveal key={benefit.title} delay={i * 80} className="flex min-w-0 items-start gap-4">
            <benefit.icon className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.5} />
            <div className="min-w-0">
              <h3 className="text-sm font-bold tracking-tight">{benefit.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{benefit.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
