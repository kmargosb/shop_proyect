'use client';

import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import {
  mapItems,
  fetchCart,
  addItemRequest,
  removeItemRequest,
  updateQuantityRequest,
} from './cart.service';

/* ================= TYPES ================= */

export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
};

export type OptimisticCartItem = {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string | null;
  size?: string | null;
  color?: string | null;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  loading: boolean;
  hydrated: boolean;
  cartBusy: boolean;
  setOpen: (value: boolean) => void;

  addItem: (
    productId: string,
    variantId: string,
    quantity?: number,
    openDrawer?: boolean,
    optimisticItem?: OptimisticCartItem,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  increaseQuantity: (itemId: string) => Promise<void>;
  decreaseQuantity: (itemId: string) => Promise<void>;

  clearCart: () => void;

  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */

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

  /**
   * Cola de sincronización del carrito.
   * Agrupa cambios rápidos para reducir peticiones.
   */
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

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      const items = await fetchCart();

      itemsRef.current = items;
      setItems(items);

      setHydrated(true);
    };

    init();
  }, []);

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
  }, []);

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
      addLocalItem(productId, variantId, quantity, optimisticItem);
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

  const applyLocalChange = (itemId: string, delta: number) => {
    let updated: CartItem[] = [];

    updated = itemsRef.current.map((item) => {
      if (item.id !== itemId) {
        return item;
      }

      const nextQuantity = Math.max(1, Math.min(item.stock, item.quantity + delta));

      return {
        ...item,
        quantity: nextQuantity,
      };
    });

    itemsRef.current = updated;
    setItems(updated);
  };

  const addLocalItem = (
    productId: string,
    variantId: string,
    quantity: number,
    optimisticItem: OptimisticCartItem,
  ) => {
    const existing = itemsRef.current.find(
      (i) => i.productId === productId && i.variantId === variantId,
    );

    let updated: CartItem[];

    if (existing) {
      updated = itemsRef.current.map((i) =>
        i.id === existing.id
          ? {
              ...i,
              quantity: Math.min(i.stock, i.quantity + quantity),
            }
          : i,
      );
    } else {
      updated = [
        ...itemsRef.current,
        {
          id: `optimistic-${Date.now()}`,
          ...optimisticItem,
        },
      ];
    }

    itemsRef.current = updated;
    setItems(updated);
  };

  /* ================= INCREASE ================= */

  const increaseQuantity = async (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);

    if (!item) return;

    // UI inmediata
    applyLocalChange(itemId, 1);

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
    applyLocalChange(itemId, -1);

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
