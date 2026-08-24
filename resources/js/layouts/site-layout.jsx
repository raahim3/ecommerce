import { Head, usePage } from "@inertiajs/react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSidebar } from "@/components/site/cart-sidebar";
import { ScrollToTop } from "@/components/common/scroll-to-top";

export function SiteLayout({ children }) {
  const { props } = usePage();
  const general = props?.app_settings?.general || {};
  const seo = props?.app_settings?.seo || {};

  const pageTitle = seo.metaTitle || general.storeName || "ATELIER — Modern Essentials";
  const pageDescription = seo.metaDescription || "Curated audio, timepieces, Mongolian cashmere knitwear, and artisanal home goods.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {seo.metaKeywords && <meta name="keywords" content={seo.metaKeywords} />}
        <meta property="og:title" content={seo.ogTitle || pageTitle} />
        <meta property="og:description" content={seo.ogDescription || pageDescription} />
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
