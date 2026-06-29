'use client';

import { useEffect, useState } from 'react';

import type { Product } from '@/types/product';

import { productsApi } from '@/features/products/api/products.api';
import { useProductsLive } from '../hooks/useProductsLive';

import ProductCard from './ProductCard';
import ProductsSkeleton from './ProductsSkeleton';

type Props = {
  brand?: string;
  initialProducts?: Product[];
};

export default function ProductsClient({ brand, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!initialProducts);

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

  if (loading) {
    return <ProductsSkeleton />;
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
