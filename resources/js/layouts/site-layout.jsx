import { Head, usePage } from "@inertiajs/react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSidebar } from "@/components/site/cart-sidebar";
import { ScrollToTop } from "@/components/common/scroll-to-top";

export function SiteLayout({ children }) {
  const { props } = usePage();
  const general = props?.app_settings?.general || {};
  const seo = props?.app_settings?.seo || {};
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const pageMeta = {
    "/": { title: seo.metaTitle, description: seo.metaDescription },
    "/shop": { title: "Shop Curated Essentials | Atelier", description: "Explore Atelier's curated collection of modern essentials, from precision timepieces and audio to fashion and home goods." },
    "/about": { title: "Our Story | Atelier", description: "Discover Atelier's approach to considered design, enduring materials and responsible craftsmanship." },
    "/contact": { title: "Contact Atelier Client Care", description: "Get help with orders, shipping, returns, sizing and product questions from Atelier Client Care." },
    "/order-tracking": { title: "Track Your Atelier Order", description: "Track your Atelier order and view the latest delivery status." },
  }[path] || {};

  const pageTitle = pageMeta.title || seo.metaTitle || general.storeName || "ATELIER — Modern Essentials";
  const pageDescription = pageMeta.description || seo.metaDescription || "Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods.";
  const canonicalUrl = typeof window !== "undefined" ? `${window.location.origin}${path}` : "/";
  const isPrivatePage = ["/checkout", "/account", "/wishlist", "/login", "/register", "/forgot-password"].includes(path)
    || path.startsWith("/reset-password");
  const socialImageValue = seo.ogImage || general.logoLight || "/build/assets/hero.jpg";
  const socialImage = typeof window !== "undefined"
    ? new URL(socialImageValue, window.location.origin).href
    : socialImageValue;

  return (
    <>
      <Head>
        <title head-key="title">{pageTitle}</title>
        <meta head-key="description" name="description" content={pageDescription} />
        <meta head-key="robots" name="robots" content={isPrivatePage ? "noindex,nofollow" : "index,follow"} />
        <link head-key="canonical" rel="canonical" href={canonicalUrl} />
        {seo.metaKeywords && <meta head-key="keywords" name="keywords" content={seo.metaKeywords} />}
        <meta head-key="og:type" property="og:type" content="website" />
        <meta head-key="og:site_name" property="og:site_name" content={general.storeName || "Atelier"} />
        <meta head-key="og:url" property="og:url" content={canonicalUrl} />
        <meta head-key="og:title" property="og:title" content={seo.ogTitle || pageTitle} />
        <meta head-key="og:description" property="og:description" content={seo.ogDescription || pageDescription} />
        <meta head-key="og:image" property="og:image" content={socialImage} />
        <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta head-key="twitter:title" name="twitter:title" content={seo.ogTitle || pageTitle} />
        <meta head-key="twitter:description" name="twitter:description" content={seo.ogDescription || pageDescription} />
        <meta head-key="twitter:image" name="twitter:image" content={socialImage} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: general.storeName || "Atelier",
          url: typeof window !== "undefined" ? window.location.origin : undefined,
          logo: general.logoLight ? new URL(general.logoLight, canonicalUrl).href : undefined,
        })}</script>
        {general.favicon ? (
          <link rel="icon" type="image/x-icon" href={general.favicon} />
        ) : (
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        )}
      </Head>
      <ScrollToTop />
      <Header />
      <CartSidebar />
      {children}
      <Footer />
    </>
  );
}
