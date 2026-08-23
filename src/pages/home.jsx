import { Hero } from "@/components/site/hero";
import { Categories } from "@/components/site/categories";
import { Trending } from "@/components/site/trending";
import { FlashSale } from "@/components/site/flash-sale";
import { BestSellers } from "@/components/site/best-sellers";
import { Editorial } from "@/components/site/editorial";
import { Benefits } from "@/components/site/benefits";
import { Reviews } from "@/components/site/reviews";
import { Newsletter } from "@/components/site/newsletter";
import { SocialGallery } from "@/components/site/social-gallery";

export function HomePage() {
  return (
    <main>
      <Hero />
      <Categories />
      <Trending />
      <FlashSale />
      <BestSellers />
      <Editorial />
      <Benefits />
      <Reviews />
      <Newsletter />
      <SocialGallery />
    </main>
  );
}
