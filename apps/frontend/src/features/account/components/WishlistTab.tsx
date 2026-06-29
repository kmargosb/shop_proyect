'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/shared/lib/api';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/WishListContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type WishlistItem = {
  id: string;
  productId: string;

  product: {
    id: string;
    name: string;
    price: number;

    brand?: {
      name: string;
    } | null;

    images?: {
      url: string;
      isPrimary?: boolean;
    }[];
  };
};

export default function WishlistTab() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist } = useWishlist();
  const { t } = useLanguage();

  const loadWishlist = async () => {
    try {
      const res = await apiFetch('/wishlist');

      if (!res || !res.ok) {
        return;
      }

      const data = await res.json();

      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <div className="rounded-2xl border md:rounded-3xl border-white/10 bg-neutral-950 p-4 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold md:text-2xl text-white">{t.wishlist.title}</h2>

          <p className="mt-1 text-xs md:mt-2 md:text-sm text-neutral-500">{t.wishlist.description}</p>
        </div>

        <div className="text-right">
          <p className="text-xs tracking-[0.2em] text-neutral-600 uppercase">{t.wishlist.items}</p>

          <p className="text-lg font-semibold text-white">{items.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 text-center md:mt-8 text-neutral-500">{t.wishlist.loading}</div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl md:mt-8 md:rounded-3xl border border-dashed border-white/10 p-6 text-center md:p-10">
          <Heart size={40} className="mx-auto text-neutral-700" />

          <h3 className="mt-4 text-lg font-medium text-white">{t.wishlist.emptyTitle}</h3>

          <p className="mt-1 text-xs md:mt-2 md:text-sm text-neutral-500">{t.wishlist.emptyDescription}</p>

          <Link
            href="/shop"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2.5 md:mt-6 md:rounded-2xl md:px-5 md:py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            {t.wishlist.exploreProducts}
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-8 md:gap-3 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const image =
              item.product.images?.find((img) => img.isPrimary)?.url ??
              item.product.images?.[0]?.url ??
              '/placeholder-product.png';

            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border md:rounded-3xl border-white/10 bg-black"
              >
                <Link href={`/product/${item.product.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={image}
                      alt={item.product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="space-y-2 p-2.5 md:space-y-3 md:p-4">
                  {item.product.brand?.name && (
                    <p className="text-[10px] tracking-[0.15em] text-neutral-500 uppercase">
                      {item.product.brand.name}
                    </p>
                  )}

                  <Link href={`/product/${item.product.id}`} className="block">
                    <h3 className="line-clamp-2 min-h-[34px] text-xs md:min-h-[40px] md:text-sm font-medium text-white">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white md:text-base">
                      €{(item.product.price / 100).toFixed(2)}
                    </p>

                    <button
                      onClick={async () => {
                        await toggleWishlist(item.productId);

                        setItems((prev) =>
                          prev.filter((wishlistItem) => wishlistItem.productId !== item.productId),
                        );
                      }}
                      className="rounded-full p-2 text-rose-500 transition hover:bg-white/5"
                    >
                      <Heart size={18} className="fill-rose-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
