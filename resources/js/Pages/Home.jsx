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
import { SiteLayout } from "@/layouts/site-layout";

export function Home({ categories, trendingProducts, flashSaleProducts, bestSellers, bestSellerCategories, recentReviews }) {
  return (
    <main>
      <Hero />
      <Categories items={categories} />
      <Trending items={trendingProducts} />
      <FlashSale items={flashSaleProducts} />
      <BestSellers items={bestSellers} categories={bestSellerCategories || categories} />
      <Editorial />
      <Benefits />
      <Reviews items={recentReviews} />
      <Newsletter />
      <SocialGallery />
    </main>
  );
}

Home.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default Home;
