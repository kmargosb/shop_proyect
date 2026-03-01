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
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}