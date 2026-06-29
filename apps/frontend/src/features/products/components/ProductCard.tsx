'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/WishListContext';
import type { Product } from '@/types/product';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { t } = useLanguage();

  const wishlisted = isWishlisted(product.id);

  const availableStock =
    product.variants?.reduce((total, variant) => total + (variant.stock ?? 0), 0) ?? 0;

  const outOfStock = availableStock <= 0;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ??
    product.images?.[0]?.url ??
    '/placeholder-product.png';

  const hoverImage = product.images?.[1]?.url ?? primaryImage;

  return (
    <div
      className={`group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all duration-200 ${
        outOfStock ? 'opacity-60' : 'hover:border-neutral-600'
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
            className="absolute top-3 right-3 z-20 rounded-full bg-black/60 p-2 backdrop-blur"
          >
            <Heart
              size={18}
              className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}
            />
          </button>
          <div className="absolute inset-0 overflow-hidden">
            {outOfStock && (
              <span className="absolute top-3 left-3 z-10 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-red-300">
                {t.productCard.soldOut}
              </span>
            )}
            {/* MAIN */}
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-0"
            />

            {/* HOVER */}
            <Image
              src={hoverImage}
              alt={product.name}
              fill
              className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          </div>
        </div>
      </Link>

      {/* INFO */}
      <div className="space-y-2 p-3 md:space-y-3 md:p-4">
        <div className="space-y-1">
          {product.brand?.name && (
            <p className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase md:text-[11px]">
              {product.brand.name}
            </p>
          )}

          <Link
            href={`/product/${product.id}`}
            className="line-clamp-2 block min-h-[32px] text-xs leading-tight font-medium text-white md:min-h-[40px] md:text-sm"
          >
            {product.name}
          </Link>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-white md:text-lg">€{(product.price / 100).toFixed(2)}</p>

          {!outOfStock && availableStock <= 5 && (
            <p className="text-xs text-amber-400">
              {availableStock} {t.productCard.left}
            </p>
          )}
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <div
            className={`w-full rounded-md bg-white py-1.5 text-center text-xs font-medium text-black transition-transform duration-150 hover:bg-neutral-200 ${
              outOfStock ? '' : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            {t.productCard.viewProduct}
          </div>
        </Link>
      </div>
    </div>
  );
}
