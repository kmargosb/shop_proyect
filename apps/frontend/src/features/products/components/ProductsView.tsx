'use client';

import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/shared/ui/skeleton';
import { productsApi } from '@/features/products/api/products.api';
import { socket } from '@/shared/lib/socket';
import type { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { useLanguage } from '@/shared/i18n/LanguageContext';

interface Props {
  brand?: string;
}

export default function ProductsView({ brand }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const loadProducts = async () => {
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
    loadProducts();
  }, [brand]);

  useEffect(() => {
    const handleProductUpdated = () => {
      loadProducts();
    };

    socket.on('productUpdated', handleProductUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
    };
  }, [brand]);

  useEffect(() => {
    if (window.innerWidth >= 768) return;

    const el = carouselRef.current;

    if (!el) return;

    const timer = setTimeout(() => {
      el.scrollTo({
        left: 50,
        behavior: 'smooth',
      });
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const skeletons = Array.from({ length: 8 });

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

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6"
      >
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} className="min-w-[48%] md:min-w-0">
                <div className="overflow-hidden rounded-2xl bg-white">
                  <Skeleton className="aspect-[4/5] w-full" />

                  <div className="space-y-3 p-3">
                    <Skeleton className="h-3 w-20" />

                    <Skeleton className="h-5 w-4/5" />

                    <Skeleton className="h-4 w-16" />

                    <Skeleton className="mt-4 h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className="min-w-[48%] md:min-w-0">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
