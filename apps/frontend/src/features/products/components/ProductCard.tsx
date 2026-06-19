"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/features/wishlist/WishListContext";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = isWishlisted(product.id);

  const availableStock =
    product.variants?.reduce(
      (total, variant) => total + (variant.stock ?? 0),
      0,
    ) ?? 0;

  const outOfStock = availableStock <= 0;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ??
    product.images?.[0]?.url ??
    "/placeholder-product.png";

  const hoverImage = product.images?.[1]?.url ?? primaryImage;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={`group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 transition-all ${
        outOfStock ? "opacity-60" : "hover:border-neutral-600"
      }`}
    >
      {/* IMAGE */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              toggleWishlist(product.id);
            }}
            className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 backdrop-blur"
          >
            <Heart
              size={18}
              className={
                wishlisted ? "fill-rose-500 text-rose-500" : "text-white"
              }
            />
          </button>
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            {outOfStock && (
              <span className="absolute top-3 left-3 z-10 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-red-300">
                Sin stock
              </span>
            )}
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
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <div className="space-y-1">
          {product.brand?.name && (
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-neutral-500">
              {product.brand.name}
            </p>
          )}

          <Link
            href={`/product/${product.id}`}
            className="block text-xs md:text-sm font-medium text-white leading-tight line-clamp-2 min-h-[32px] md:min-h-[40px]"
          >
            {product.name}
          </Link>
        </div>

        <div className="space-y-1">
          <p className="text-white md:text-lg font-semibold">
            €{(product.price / 100).toFixed(2)}
          </p>

          {!outOfStock && availableStock <= 5 && (
            <p className="text-xs text-amber-400">
              Solo quedan {availableStock}
            </p>
          )}
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: outOfStock ? 1 : 1.02 }}
            transition={{ duration: 0.15 }}
            className="w-full bg-white text-black py-1.5 rounded-md font-medium text-xs text-center hover:bg-neutral-200"
          >
            View product
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
