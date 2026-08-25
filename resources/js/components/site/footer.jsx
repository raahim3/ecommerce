import { Link, usePage } from "@inertiajs/react";

const PAGE_URLS = { shop: "/shop", about: "/about", contact: "/contact", wishlist: "/wishlist", account: "/account" };
const DEFAULT_COLUMNS = {
  footerShopLinks: [{ label: "Shop All", type: "page", target: "shop" }, { label: "Sale & Offers", type: "custom", target: "/shop?sale=true" }],
  footerServiceLinks: [{ label: "My Account", type: "page", target: "account" }, { label: "Saved Wishlist", type: "page", target: "wishlist" }],
  footerCompanyLinks: [{ label: "Our Story", type: "page", target: "about" }, { label: "Contact & Support", type: "page", target: "contact" }],
};

function LinkColumn({ title, items, categories }) {
  const hrefFor = (item) => {
    if (item.type === "custom") return item.target || "/";
    if (item.type === "category") {
      const category = categories.find((entry) => String(entry.id) === String(item.target) || entry.slug === item.target);
      return category ? `/shop?category=${encodeURIComponent(category.slug || category.name)}` : "/shop";
    }
    return PAGE_URLS[item.target] || item.target || "/";
  };
  return <nav aria-label={title} className="min-w-0"><h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-foreground/50 uppercase">{title}</h3><ul className="mt-5 space-y-3 text-sm">{items.map((item) => <li key={`${item.label}-${item.target}`}><Link href={hrefFor(item)} className="text-ink-foreground/75 transition-colors duration-300 hover:text-ink-foreground">{item.label}</Link></li>)}</ul></nav>;
}

export function Footer() {
  const { props } = usePage();
  const general = props?.app_settings?.general || {};
  const navigation = props?.app_settings?.navigation || {};
  const categories = props?.app_settings?.navigationCategories || [];
  const store = general.storeName || "ATELIER";
  const year = new Date().getFullYear();
  const description = (navigation.footerDescription || "Curated essentials for modern living. Designed in Copenhagen, shipped worldwide with sustainable packaging.").replace("{store}", store);
  const copyright = (navigation.footerCopyright || "© {year} {store} All rights reserved.").replace("{year}", String(year)).replace("{store}", store);

  return <footer className="bg-ink text-ink-foreground"><div className="shell grid gap-12 py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-10 lg:py-16"><div className="min-w-0"><Link href="/" className="text-lg font-extrabold tracking-[-0.06em]">{general.logoLight ? <img src={general.logoLight} alt={store} className="h-14 w-auto object-contain" /> : <>{store}<span className="text-accent">.</span></>}</Link><p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/60">{description}</p></div><LinkColumn title="Shop" items={navigation.footerShopLinks || DEFAULT_COLUMNS.footerShopLinks} categories={categories} /><LinkColumn title="Account & Services" items={navigation.footerServiceLinks || DEFAULT_COLUMNS.footerServiceLinks} categories={categories} /><LinkColumn title="Company & Help" items={navigation.footerCompanyLinks || DEFAULT_COLUMNS.footerCompanyLinks} categories={categories} /></div><div className="border-t border-ink-foreground/10"><div className="shell py-6 text-xs text-ink-foreground/55"><p>{copyright}</p></div></div></footer>;
}