'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { useCartUI } from '@/features/cart/CartUIContext';

export default function CartButton() {
  const { totalItems } = useCart();
  const { openCart } = useCartUI();

  return (
    <button onClick={openCart} className="relative">
      <ShoppingCart size={24} />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-black px-2 py-1 text-xs text-white">
          {totalItems}
        </span>
      )}
    </button>
  );
}
