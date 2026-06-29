'use client';

import type { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import { productsApi } from '@/features/products/api/products.api';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useProductsLive } from '../hooks/useProductsLive';
import ProductCard from './ProductCard';
import ProductsSkeleton from './ProductsSkeleton';

interface Props {
  brand?: string;
  initialProducts?: Product[];
}

export default function ProductsView({ brand, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);
  const { t } = useLanguage();

  const loadProducts = async () => {
    if (initialProducts && !brand) {
      return;
    }
    try {
      const data = brand ? await productsApi.getByBrand(brand) : await productsApi.getAll();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts && !brand) {
      return;
    }
    loadProducts();
  }, [brand, initialProducts]);

  useProductsLive(!(initialProducts && !brand), loadProducts);

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
        {loading ? (
          <ProductsSkeleton />
        ) : (
          products.map((product) => (
            <div key={product.id} className="min-w-[48%] md:min-w-0">
              <ProductCard product={product} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
