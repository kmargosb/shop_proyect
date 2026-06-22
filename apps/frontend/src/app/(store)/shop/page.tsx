import type { Metadata } from 'next';
import { ShopView } from '@/features/shop/components/ShopView';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Explore the latest Camarguette collection. Contemporary clothing inspired by skateboarding, craftsmanship and timeless design.',
};

export default function Page() {
  return <ShopView />;
}
