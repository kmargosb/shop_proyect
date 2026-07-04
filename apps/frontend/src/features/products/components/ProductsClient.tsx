'use client';

import type { Product } from '@/types/product';
import { useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';

import ProductCard from './ProductCard';
import ProductsSkeleton from './ProductsSkeleton';
import QueryErrorState from '@/shared/components/query/QueryErrorState';

type Props = {
  brand?: string;
  initialProducts?: Product[];
};

export default function ProductsClient({ brand, initialProducts }: Props) {
  const queryString = useMemo(() => {
    if (!brand) return '';

    return new URLSearchParams({
      brand,
    }).toString();
  }, [brand]);

  const {
    data: products = [],
    isPending: loading,
    isError,
    error,
    refetch,
  } = useProducts({
    queryString,
    enabled: !initialProducts || !!brand,
    initialData: initialProducts,
  });

  if (loading) {
    return <ProductsSkeleton />;
  }

  if (isError) {
    return (
      <div className="w-full">
        <QueryErrorState
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <div key={product.id} className="min-w-[48%] md:min-w-0">
          <ProductCard product={product} />
        </div>
      ))}
    </>
  );
}
