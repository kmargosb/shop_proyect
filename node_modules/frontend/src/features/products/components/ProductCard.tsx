"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-all"
    >
      {/* IMAGE */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            {/* MAIN */}
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />

            {/* HOVER */}
            <Image
              src={hoverImage}
              alt={product.name}
              fill
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>
        </div>
      </Link>

      {/* INFO */}
      <div className="p-4 space-y-3">
        <Link
          href={`/product/${product.id}`}
          className="block text-sm font-medium text-white hover:underline"
        >
          {product.name}
        </Link>

        <p className="text-lg font-semibold">
          €{(product.price / 100).toFixed(2)}
        </p>

        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.15 }}
          className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-neutral-200 cursor-pointer"
        >
          Añadir al carrito
        </motion.button>
      </div>
    </motion.div>
  );
}
