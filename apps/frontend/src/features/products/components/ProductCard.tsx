"use client";

import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

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
        },
      })
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      <h2 className="text-lg font-semibold">{product.name}</h2>

      <p>${product.price}</p>

      <Button onClick={addToCart}>
        Añadir al carrito
      </Button>
    </div>
  );
}