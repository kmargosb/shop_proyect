'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';
import { useLanguage } from '@/shared/i18n/LanguageContext';

interface Props {
  productId: string;
}

export default function RelatedProducts({ productId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadRelated = async () => {
      const res = await apiFetch(`/products/${productId}/related`);

      if (!res || !res.ok) {
        console.error('Related products fetch failed');
        return;
      }

      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };

    loadRelated();
  }, [productId]);

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
  }, [products]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-20 border-t border-neutral-800 pt-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] text-neutral-500 uppercase">
          {t.relatedProducts.label}
        </p>

        <h2 className="mt-3 text-4xl font-bold text-black md:text-5xl">
          {t.relatedProducts.title}
        </h2>

        <p className="mt-3 text-sm text-neutral-400 md:text-base">{t.relatedProducts.subtitle}</p>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[48%] md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
