'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { applyLocalChange, addLocalItem } from './cart.optimistic';
import { useCartInit } from './hooks/useCartInit';
import type { CartItem, OptimisticCartItem, CartContextType } from './types';
import {
  mapItems,
  fetchCart,
  addItemRequest,
  removeItemRequest,
  updateQuantityRequest,
} from './cart.service';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef<CartItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);

  useCartInit({
    itemsRef,
    setItems,
    setHydrated,
  });

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

  /* ================= SYNC QUEUE ================= */

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

      // NO sincronizamos el carrito aquí.
      // La UI optimista ya es la fuente de verdad.
    } catch (err) {
      console.error(err);

      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);
    }
  };

  /* ================= ADD ITEM ================= */

  const addItem = async (
    productId: string,
    variantId: string,
    quantity = 1,
    openDrawer = true,
    optimisticItem?: OptimisticCartItem,
  ) => {
    if (openDrawer) {
      setLoading(true);
      setOpen(true);
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
      setLoading(false);

      if (openDrawer) {
        setOpen(false);
      }

      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);

      throw new Error('Connection error');
    }

    if (!res.ok) {
      setLoading(false);

      if (openDrawer) {
        setOpen(false);
      }

      const data = await res.json().catch(() => null);

      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);

      throw new Error(data?.error || 'No se pudo añadir al carrito');
    }
    const cart = await res.json();

    const synced = mapItems(cart);

    itemsRef.current = synced;
    setItems(synced);

    setLoading(false);
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (itemId: string) => {
    setCartBusy(true);
    const previous = itemsRef.current;
    const updated = previous.filter((i) => i.id !== itemId);
    itemsRef.current = updated;

    setItems(updated);

    if (updated.length === 0) {
      setTimeout(() => setOpen(false), 180);
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
        const synced = mapItems(data.cart);

        itemsRef.current = synced;
        setItems(synced);
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

    // UI inmediata
    const updated = applyLocalChange(itemsRef.current, itemId, 1);

    itemsRef.current = updated;
    setItems(updated);

    const key = `${item.productId}:${item.variantId}`;

    const existing = pendingSyncRef.current.get(key);

    pendingSyncRef.current.set(key, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: (existing?.quantity ?? 0) + 1,
    });

    if (!syncTimeoutRef.current) {
      syncTimeoutRef.current = setTimeout(flushCartQueue, 250);
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

    // UI inmediata
    const updated = applyLocalChange(itemsRef.current, itemId, -1);

    itemsRef.current = updated;
    setItems(updated);

    const key = `${item.productId}:${item.variantId}`;

    const existing = pendingSyncRef.current.get(key);

    pendingSyncRef.current.set(key, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: (existing?.quantity ?? 0) - 1,
    });

    if (!syncTimeoutRef.current) {
      syncTimeoutRef.current = setTimeout(flushCartQueue, 250);
    }
  };

  /* ================= CLEAR ================= */

  const clearCart = () => {
    setItems([]);
  };

  /* ================= TOTALS ================= */

  const totalItems = items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

  const totalPrice = items.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        loading,
        hydrated,
        cartBusy,
        setOpen,
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
