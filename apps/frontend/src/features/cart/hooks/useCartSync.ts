import { useRef } from 'react';
import { fetchCart, updateQuantityRequest } from '../cart.service';
import type { CartItem } from '../types';

type Props = {
  itemsRef: React.MutableRefObject<CartItem[]>;
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export function useCartSync({ itemsRef, setItems }: Props) {
  const pendingSyncRef = useRef<
    Map<
      string,
      {
        productId: string;
        variantId: string;
        quantity: number;
      }
    >
  >(new Map());

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushCartQueue = async () => {
    syncTimeoutRef.current = null;

    if (pendingSyncRef.current.size === 0) {
      return;
    }

    const operations = Array.from(pendingSyncRef.current.values());

    pendingSyncRef.current.clear();

    try {
      await Promise.all(
        operations.map((op) => updateQuantityRequest(op.productId, op.variantId, op.quantity)),
      );
    } catch (err) {
      console.error(err);

      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);
    }
  };

  const queueUpdate = (productId: string, variantId: string, delta: number) => {
    const key = `${productId}:${variantId}`;

    const existing = pendingSyncRef.current.get(key);

    pendingSyncRef.current.set(key, {
      productId,
      variantId,
      quantity: (existing?.quantity ?? 0) + delta,
    });

    if (!syncTimeoutRef.current) {
      syncTimeoutRef.current = setTimeout(flushCartQueue, 250);
    }
  };

  return {
    queueUpdate,
  };
}
