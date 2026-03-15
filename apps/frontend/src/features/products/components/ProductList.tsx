"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

import type { Product } from "@/types/product";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const res = await apiFetch("/products");

      if (!res) return;

      const data = await res.json();

      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, []);

  const skeletons = Array.from({ length: 8 });

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10">Productos</h1>

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
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
      </div>
    </section>
  );
}