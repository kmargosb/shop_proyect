import type { Metadata } from 'next';

import HeroCarousel from '@/components/store/HeroCarousel';
import ProductsView from '@/features/products/components/ProductsView';
import FeaturedBrands from '@/components/store/FeaturedBrands';
import HomeCTA from '@/components/store/HomeCTA';
import Footer from '@/components/store/Footer';
import BrandsShowcase from '@/components/store/BrandsShowcase';
import { getProducts } from '@/shared/server/api/products';

export const metadata: Metadata = {
  title: 'Contemporary Clothing',
  description:
    'Contemporary clothing inspired by skateboarding, craftsmanship and timeless design.',
};

export default async function Home() {
  const products = await getProducts();
  return (
    <main>
      <HeroCarousel />
      <ProductsView initialProducts={products} />
      <BrandsShowcase />
      <HomeCTA />
      <Footer />
    </main>
  );
}
