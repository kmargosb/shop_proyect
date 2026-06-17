"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/shared/ui/skeleton";

import { productsApi } from "@/features/products/api/products.api"; // ✅ NEW

import type { Product } from "@/types/product";

interface Props {
  brand?: string;
}

export default function ProductList({ brand }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = brand
          ? await productsApi.getByBrand(brand)
          : await productsApi.getAll();

        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [brand]);

  const skeletons = Array.from({ length: 8 });

  return (
    <section className="w-full px-2 md:px-6 py-6">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            New Collection
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            {brand ? `Productos de ${brand}` : "Latest Drops"}
          </h1>

          <p className="mt-3 text-sm text-neutral-400 md:text-base">
            Las últimas piezas seleccionadas para esta temporada.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <p className="text-sm text-neutral-500">
            {products.length} productos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {loading
          ? skeletons.map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900 rounded-xl overflow-hidden p-4 space-y-4"
              >
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
}
