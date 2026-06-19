"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";

interface Props {
  productId: string;
}

export default function RelatedProducts({ productId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelated = async () => {
      const res = await apiFetch(`/products/${productId}/related`);

      if (!res || !res.ok) {
        console.error("Related products fetch failed");
        return;
      }

      const data = await res.json();
      setProducts(data);
      setLoading(false);
    };

    loadRelated();
  }, [productId]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-20 border-t border-neutral-800 pt-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Recommended
        </p>

        <h2 className="mt-2 text-3xl font-bold">You may also like</h2>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
