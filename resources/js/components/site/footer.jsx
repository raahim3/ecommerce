import { Link } from "@inertiajs/react";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: () => (
      <svg className="size-4 fill-none stroke-current" strokeWidth="1.7" viewBox="0 0 24 24">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: () => (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com",
    icon: () => (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: () => (
      <svg className="size-4 fill-current" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="shell grid gap-12 py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10 lg:py-16">
        <div className="min-w-0">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.06em]">
            ATELIER<span className="text-accent">.</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/60 leading-relaxed">
            Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.
          </p>
          <div className="mt-7 flex gap-2.5">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="grid size-10 place-items-center rounded-full border border-ink-foreground/15 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Column 1: Shop */}
        <nav aria-label="Shop Links" className="min-w-0">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-foreground/50 uppercase">
            Shop
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { label: "Shop All", href: "/shop" },
              { label: "Fashion & Knitwear", href: "/shop?category=Fashion" },
              { label: "Studio Electronics", href: "/shop?category=Electronics" },
              { label: "Leather & Watches", href: "/shop?category=Accessories" },
              { label: "Home & Lifestyle", href: "/shop?category=Lifestyle" },
              { label: "Sale & Offers", href: "/shop?sale=true" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Column 2: Account */}
        <nav aria-label="Account Links" className="min-w-0">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-foreground/50 uppercase">
            Account & Services
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to="/account"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent"
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                to="/track-order"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link
                to="/wishlist"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent"
              >
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent"
              >
                Create Account
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-accent flex items-center gap-1.5"
              >
                <span>Admin Dashboard</span>
                <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent">PRO</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Column 3: Company */}
        <nav aria-label="Company Links" className="min-w-0">
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-foreground/50 uppercase">
            Company & Help
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                to="/about"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground"
              >
                Our Story & Ateliers
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground"
              >
                Sustainability Standards
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground"
              >
                Contact & Support
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground"
              >
                Shipping & Returns FAQs
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="shell grid gap-4 py-6 text-xs text-ink-foreground/55 sm:grid-cols-[1fr_auto] sm:items-center">
          <p>© 2026 Atelier Studios Inc. All rights reserved.</p>
          <ul className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"].map((method) => (
              <li
                key={method}
                className="rounded-md border border-ink-foreground/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
