'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { socket } from '@/shared/lib/socket';
import { addLocalItem, applyLocalChange } from './lib/cart.optimistic';
import { useCartInit } from './hooks/useCartInit';
import type { CartItem, OptimisticCartItem, CartContextType } from './types';
import { getTotalItems, getTotalPrice } from './utils/cartTotals';
import { mapItems, fetchCart, addItemRequest, removeItemRequest } from './cart.service';
import { useCartUI } from './CartUIContext';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef<CartItem[]>([]);
  const { openCart, closeCart } = useCartUI();

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const handleCartUpdated = async () => {
      try {
        console.log('📡 cartUpdated socket');
        const synced = await fetchCart();

        itemsRef.current = synced;
        setItems(synced);
      } catch (error) {
        console.error('Cart sync failed:', error);
      }
    };

    socket.on('cartUpdated', handleCartUpdated);

    return () => {
      socket.off('cartUpdated', handleCartUpdated);
    };
  }, []);

  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);

  const syncCart = (cart: any) => {
    const synced = mapItems(cart);

    itemsRef.current = synced;
    setItems(synced);
  };

  useCartInit({
    itemsRef,
    setItems,
    setHydrated,
  });

  /* ================= ADD ITEM ================= */

  const addItem = async (
    productId: string,
    variantId: string,
    quantity = 1,
    openDrawer = true,
    optimisticItem?: OptimisticCartItem,
  ) => {
    if (cartBusy) return;

    setCartBusy(true);

    try {
      if (openDrawer) {
        setLoading(true);
        openCart();
      }

      if (optimisticItem) {
        const updated = addLocalItem(
          itemsRef.current,
          productId,
          variantId,
          quantity,
          optimisticItem,
        );

        itemsRef.current = updated;
        setItems(updated);
      }

      const res = await addItemRequest(productId, variantId, quantity);

      if (!res) {
        const items = await fetchCart();

        itemsRef.current = items;
        setItems(items);

        throw new Error('Connection error');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        const items = await fetchCart();

        itemsRef.current = items;
        setItems(items);

        throw new Error(data?.error || 'No se pudo añadir al carrito');
      }
      const cart = await res.json();

      syncCart(cart);
    } finally {
      setLoading(false);
      setCartBusy(false);
    }
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (itemId: string) => {
    setCartBusy(true);
    const previous = itemsRef.current;
    const updated = previous.filter((i) => i.id !== itemId);
    itemsRef.current = updated;

    setItems(updated);

    if (updated.length === 0) {
      setTimeout(() => closeCart(), 200);
    }

    try {
      const res = await removeItemRequest(itemId);

      if (!res || !res.ok) {
        itemsRef.current = previous;
        setItems(previous);
        return;
      }

      const data = await res.json();

      if (data?.cart) {
        syncCart(data.cart);
      }
    } catch {
      itemsRef.current = previous;
      setItems(previous);
    } finally {
      setCartBusy(false);
    }
  };

  /* ================= INCREASE ================= */

  const increaseQuantity = async (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);

    if (!item) return;

    const previous = itemsRef.current;

    const updated = applyLocalChange(previous, itemId, 1);

    itemsRef.current = updated;
    setItems(updated);

    setCartBusy(true);

    try {
      const res = await addItemRequest(item.productId, item.variantId, 1);

      if (!res || !res.ok) {
        itemsRef.current = previous;
        setItems(previous);
        return;
      }

      const cart = await res.json();

      syncCart(cart);
    } catch {
      itemsRef.current = previous;
      setItems(previous);
    } finally {
      setCartBusy(false);
    }
  };

  /* ================= DECREASE ================= */

  const decreaseQuantity = async (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);

    if (!item) return;

    if (item.quantity === 1) {
      await removeItem(itemId);
      return;
    }

    setCartBusy(true);

    try {
      const res = await addItemRequest(item.productId, item.variantId, -1);

      if (!res || !res.ok) {
        return;
      }

      const cart = await res.json();
      syncCart(cart);
    } finally {
      setCartBusy(false);
    }
  };

  /* ================= CLEAR ================= */

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = getTotalItems(items);
  const totalPrice = getTotalPrice(items);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        hydrated,
        cartBusy,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
