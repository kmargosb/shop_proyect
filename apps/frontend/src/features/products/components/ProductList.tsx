"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch("/products");

        if (!res) return;

        const data = await res.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <p>Cargando productos...</p>;

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map((p) => (
      <ProductCard
        key={p.id}
        product={p}
        onAddToCart={(product) =>
          window.dispatchEvent(
            new CustomEvent("add-to-cart", { detail: product })
          )
        }
      />
    ))}
  </div>
);
}