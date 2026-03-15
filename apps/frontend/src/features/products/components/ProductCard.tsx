"use client";

import Image from "next/image";
import Link from "next/link";

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

  const primaryImage = product.images?.[0]?.url ?? "/placeholder-product.png";

  const hoverImage = product.images?.[1]?.url ?? primaryImage;

  return (
    <div className="group bg-neutral-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* PRODUCT IMAGE */}

      <Link href={`/product/${product.id}`} className="block cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          {/* MAIN IMAGE */}

          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          {/* HOVER IMAGE */}

          <Image
            src={hoverImage}
            alt={product.name}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* PRODUCT INFO */}

      <div className="p-4 space-y-3">
        <Link
          href={`/product/${product.id}`}
          className="block text-sm font-medium text-white hover:underline cursor-pointer"
        >
          {product.name}
        </Link>

        <p className="text-lg font-semibold text-white">
          €{(product.price / 100).toFixed(2)}
        </p>

        <Button
          onClick={handleAddToCart}
          className="w-full bg-white text-black hover:bg-neutral-200 cursor-pointer"
        >
          Añadir al carrito
        </Button>
      </div>
    </div>
  );
}
