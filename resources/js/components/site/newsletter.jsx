import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("You're on the list ✓", { description: "Watch your inbox for the next drop." });
    setEmail("");
  };

  return (
    <section className="bg-surface py-14 lg:py-20">
      <Reveal className="shell max-w-3xl text-center">
        <p className="eyebrow">Stay in the loop</p>
        <h2 className="mt-4 text-[clamp(1.9rem,5vw,3.25rem)] leading-[1.02] font-extrabold">
          First access to every drop.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Get first access to new drops, exclusive offers and curated collections. No noise, one
          email a week.
        </p>
        <form
          onSubmit={submit}
          className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:border sm:border-border sm:bg-background sm:p-1.5"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-13 min-w-0 flex-1 rounded-full border border-border bg-background px-6 text-sm outline-none placeholder:text-subtle sm:h-11 sm:border-0 sm:bg-transparent"
          />
          <button
            type="submit"
            className="h-13 shrink-0 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground sm:h-11"
          >
            Subscribe
          </button>
        </form>
      </Reveal>
    </section>
  );
}
