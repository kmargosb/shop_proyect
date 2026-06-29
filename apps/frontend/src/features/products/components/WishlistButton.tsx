'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/WishListContext';

type Props = {
  productId: string;
};

export default function WishlistButton({ productId }: Props) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = isWishlisted(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleWishlist(productId);
      }}
      className="absolute top-3 right-3 z-20 rounded-full bg-black/60 p-2 backdrop-blur"
    >
      <Heart size={18} className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'} />
    </button>
  );
}
