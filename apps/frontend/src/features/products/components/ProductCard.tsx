"use client";

import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const addToCart = () => {
    window.dispatchEvent(
      new CustomEvent("add-to-cart", {
        detail: {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      })
    );
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-5 space-y-4">
      <h2>{product.name}</h2>
      <p>${product.price}</p>

      <Button onClick={addToCart}>
        Añadir al carrito
      </Button>
    </div>
  );
}