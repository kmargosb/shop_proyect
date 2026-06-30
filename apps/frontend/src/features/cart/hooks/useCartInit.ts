import { useEffect } from 'react';
import { socket } from '@/shared/lib/socket';
import { fetchCart } from '../cart.service';
import type { CartItem } from '../types';

type Props = {
  itemsRef: React.MutableRefObject<CartItem[]>;
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setHydrated: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useCartInit({ itemsRef, setItems, setHydrated }: Props) {
  useEffect(() => {
    const init = async () => {
      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);

      setHydrated(true);
    };

    init();
  }, [itemsRef, setItems, setHydrated]);

  useEffect(() => {
    const handleProductUpdated = async () => {
      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);
    };

    socket.on('productUpdated', handleProductUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
    };
  }, [itemsRef, setItems]);

  useEffect(() => {
    const handleCartUpdated = async () => {
      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);
    };

    socket.on('cartUpdated', handleCartUpdated);

    return () => {
      socket.off('cartUpdated', handleCartUpdated);
    };
  }, [itemsRef, setItems]);
}
