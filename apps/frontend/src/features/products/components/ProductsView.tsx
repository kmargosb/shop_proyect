'use client';

import type { Product } from '@/types/product';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import ProductsClient from './ProductsClient';

interface Props {
  brand?: string;
  initialProducts?: Product[];
}

export default function ProductsView({ brand, initialProducts }: Props) {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-white px-4 py-12 md:px-6 md:py-20">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] text-neutral-500 uppercase">{t.products.label}</p>

          <h1 className="mt-3 text-4xl font-bold text-black md:text-5xl">
            {brand ? `${brand} ${t.products.collection}` : t.products.latestDrops}
          </h1>

          <p className="mt-3 text-sm text-neutral-600 md:text-base">{t.products.subtitle}</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6">
        <ProductsClient brand={brand} initialProducts={initialProducts} />
      </div>
    </section>
  );
}
