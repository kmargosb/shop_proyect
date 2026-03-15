"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

export default function ProductList() {

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {

    const loadProducts = async () => {

      const res = await apiFetch("/products");

      if (!res) return;

      const data = await res.json();

      setProducts(data);

    };

    loadProducts();

  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-bold mb-10">
        Productos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </section>
  );
}