import type { Metadata } from 'next';
import { apiFetch } from '@/shared/lib/api';
import BrandsLanding from '@/features/brands/BrandsLanding';

export const metadata: Metadata = {
  title: 'Brands',
  description: 'Explore the brands available at Camarguette and discover their collections.',
};

export default async function BrandsPage() {
  const res = await apiFetch('/brands');

  const brands = res && res.ok ? await res.json() : [];

  return <BrandsLanding brands={brands} />;
}
