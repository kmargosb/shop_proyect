import type { Metadata } from 'next';

import HeroCarousel from '@/components/store/HeroCarousel';
import ProductsView from '@/features/products/components/ProductsView';
import FeaturedBrands from '@/components/store/FeaturedBrands';
import HomeCTA from '@/components/store/HomeCTA';
import Footer from '@/components/store/Footer';

export const metadata: Metadata = {
  title: 'Contemporary Clothing',
  description:
    'Contemporary clothing inspired by skateboarding, craftsmanship and timeless design.',
};

export default function Home() {
  return (
    <main>
      <HeroCarousel />

      <FeaturedBrands />

      <div className="mx-auto max-w-7xl px-0 py-12 md:px-6 md:py-16">
        <ProductsView />
      </div>

      <HomeCTA />

      <Footer />
    </main>
  );
}
