import type { Metadata } from 'next';
import { brandsApi } from '@/features/brands/api/brands.api';
import BrandsLanding from '@/features/brands/BrandsLanding';

export const metadata: Metadata = {
  title: 'Brands',
  description: 'Explore the brands available at Camarguette and discover their collections.',
};

export default async function BrandsPage() {
  const brands = await brandsApi.getAll();

  return <BrandsLanding brands={brands} />;
}
