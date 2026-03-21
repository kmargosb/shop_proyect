"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

import type { Product } from "@/types/product";

/* ===============================
   PROPS (NEW)
=============================== */

interface Props {
  brand?: string;
}

export default function ProductList({ brand }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const url = brand ? `/products/brand/${brand}` : "/products";

        const res = await apiFetch(url);

        if (!res || !res.ok) {
          console.error("Products fetch failed");
          return;
        }

        const data = await res.json();

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
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10">
        {brand ? `Productos de ${brand}` : "Latest Drops"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
