import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartSidebar } from "@/components/site/cart-sidebar";
import { ScrollToTop } from "@/components/common/scroll-to-top";

export function SiteLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Header />
      <CartSidebar />
      {children}
      <Footer />
    </>
  );
}
