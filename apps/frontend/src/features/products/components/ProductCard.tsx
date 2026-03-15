"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/CartContext";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {

  const { addItem } = useCart();

  const handleAddToCart = async () => {
    await addItem(product.id, 1);
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-5 space-y-4">
      <h2>{product.name}</h2>

      <p>${product.price}</p>

      <Button onClick={handleAddToCart}>
        Añadir al carrito
      </Button>
    </div>
  );
}