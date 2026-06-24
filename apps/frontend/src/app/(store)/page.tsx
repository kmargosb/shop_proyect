import type { Metadata } from 'next';

import HeroCarousel from '@/components/store/HeroCarousel';
import ProductsView from '@/features/products/components/ProductsView';
import FeaturedBrands from '@/components/store/FeaturedBrands';
import HomeCTA from '@/components/store/HomeCTA';
import Footer from '@/components/store/Footer';
import BrandsShowcase from '@/components/store/BrandsShowcase';

export const metadata: Metadata = {
  title: 'Contemporary Clothing',
  description:
    'Contemporary clothing inspired by skateboarding, craftsmanship and timeless design.',
};

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <ProductsView />
      <BrandsShowcase />
      <HomeCTA />
      <Footer />
    </main>
  );
}
