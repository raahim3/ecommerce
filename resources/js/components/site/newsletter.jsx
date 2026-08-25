import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { Reveal } from "./reveal";

export function Newsletter() {
  const { app_settings: appSettings = {} } = usePage().props;
  const settings = appSettings.homepage || {};
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Subscription failed");
      toast.success(data.message || "You're on the list.", { description: "Watch your inbox for the next drop." });
      setEmail("");
    } catch (error) {
      toast.error(error.message || "Subscription failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-surface py-14 lg:py-20">
      <Reveal className="shell max-w-3xl text-center">
        <p className="eyebrow">{settings.newsletterEyebrow || "Stay in the loop"}</p>
        <h2 className="mt-4 text-[clamp(1.9rem,5vw,3.25rem)] leading-[1.02] font-extrabold">
          {settings.newsletterTitle || "First access to every drop."}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          {settings.newsletterDescription || "Get first access to new drops, exclusive offers and curated collections. No noise, one email a week."}
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
            placeholder={settings.newsletterPlaceholder || "Enter your email"}
            className="h-13 min-w-0 flex-1 rounded-full border border-border bg-background px-6 text-sm outline-none placeholder:text-subtle sm:h-11 sm:border-0 sm:bg-transparent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="h-13 shrink-0 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground sm:h-11"
          >
            {submitting ? "Saving..." : (settings.newsletterButtonLabel || "Subscribe")}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
