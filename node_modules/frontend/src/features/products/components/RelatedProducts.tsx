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
    <section className="mt-24">
      <h2 className="text-2xl font-semibold mb-6">También te puede gustar</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}