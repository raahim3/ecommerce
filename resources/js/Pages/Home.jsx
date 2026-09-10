import { usePage } from "@inertiajs/react";
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
  const { app_settings: appSettings = {} } = usePage().props;
  const homepage = appSettings.homepage || {};

  return (
    <main>
      {homepage.heroEnabled !== false && <Hero />}
      {homepage.categoriesEnabled !== false && <Categories items={categories} />}
      {homepage.trendingEnabled !== false && <Trending items={trendingProducts} />}
      {homepage.flashSaleEnabled !== false && <FlashSale items={flashSaleProducts} />}
      {homepage.bestSellerEnabled !== false && <BestSellers items={bestSellers} categories={bestSellerCategories || categories} />}
      {homepage.editorialEnabled !== false && <Editorial />}
      {homepage.benefitsEnabled !== false && <Benefits />}
      {homepage.reviewsEnabled !== false && <Reviews items={recentReviews} />}
      {homepage.newsletterEnabled !== false && <Newsletter />}
      {homepage.socialGalleryEnabled !== false && <SocialGallery />}
    </main>
  );
}

Home.layout = (page) => <SiteLayout>{page}</SiteLayout>;

export default Home;
