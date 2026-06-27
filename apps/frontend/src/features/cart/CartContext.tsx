'use client';

import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

const CART_KEY = 'cartId';

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
  image?: string | null;
  size?: string | null;
  color?: string | null;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  loading: boolean;
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

  /**
   * Cache en memoria del carrito activo.
   * Evita consultar localStorage constantemente.
   */
  const cartIdRef = React.useRef<string | null>(null);
  /**
   * Cola de sincronización del carrito.
   * Agrupa cambios rápidos para reducir peticiones.
   */
  const pendingSyncRef = React.useRef<
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

  /* ================= HELPERS ================= */

  const mapItems = (cart: any): CartItem[] =>
    (cart.items ?? [])
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.product?.name ?? 'Producto',
        price: item.price,
        quantity: item.quantity,
        stock: item.variant?.stock ?? 0,
        image:
          item.product?.images?.find((img: any) => img.isPrimary)?.url ??
          item.product?.images?.[0]?.url ??
          null,
        size: item.variant?.size ?? null,
        color: item.variant?.color ?? null,
      }));

  /* ================= CREATE CART ================= */

  const createCart = async (): Promise<string | null> => {
    const res = await apiFetch('/cart', { method: 'POST' });

    if (!res || !res.ok) return null;

    const cart = await res.json();

    localStorage.setItem(CART_KEY, cart.id);
    cartIdRef.current = cart.id;

    return cart.id;
  };

  /* ================= ENSURE VALID CART ================= */

  const ensureCart = async (): Promise<string | null> => {
    let cartId = cartIdRef.current ?? localStorage.getItem(CART_KEY);

    if (cartId && !cartIdRef.current) {
      cartIdRef.current = cartId;
    }

    /* no cart */

    if (!cartId) {
      return await createCart();
    }

    /* validate current cart */

    const res = await apiFetch(`/cart/${cartId}`);

    /* invalid / expired / converted */

    if (!res || !res.ok) {
      localStorage.removeItem(CART_KEY);

      return await createCart();
    }

    const cart = await res.json();

    /* backend generated new cart */

    if (cart.id !== cartId) {
      localStorage.setItem(CART_KEY, cart.id);
      cartIdRef.current = cart.id;
    }

    return cart.id;
  };

  /* ================= GET ACTIVE CART ID ================= */

  const getActiveCartId = async (): Promise<string | null> => {
    if (cartIdRef.current) {
      return cartIdRef.current;
    }

    const storedCartId = localStorage.getItem(CART_KEY);

    if (storedCartId) {
      cartIdRef.current = storedCartId;
      return storedCartId;
    }

    return await createCart();
  };

  /* ================= FETCH CART ================= */

  const fetchCart = async (cartId: string) => {
    const res = await apiFetch(`/cart/${cartId}`);
    if (!res || !res.ok) return;

    const cart = await res.json();
    setItems(mapItems(cart));
  };

  /* ================= SYNC QUEUE ================= */

  const flushCartQueue = async () => {
    syncTimeoutRef.current = null;

    if (pendingSyncRef.current.size === 0) {
      return;
    }

    const cartId = await getActiveCartId();

    if (!cartId) {
      return;
    }

    const operations = Array.from(pendingSyncRef.current.values());

    pendingSyncRef.current.clear();

    try {
      await Promise.all(
        operations.map((op) =>
          apiFetch(`/cart/${cartId}/items`, {
            method: 'POST',
            body: JSON.stringify({
              productId: op.productId,
              variantId: op.variantId,
              quantity: op.quantity,
            }),
          }),
        ),
      );

      // NO sincronizamos el carrito aquí.
      // La UI optimista ya es la fuente de verdad.
    } catch (err) {
      console.error(err);

      await fetchCart(cartId);
    }
  };

  /* ================= INIT ================= */

  useEffect(() => {
    const init = async () => {
      const cartId = await ensureCart();
      if (!cartId) return;

      await fetchCart(cartId);
    };

    init();
  }, []);

  useEffect(() => {
    const handleProductUpdated = async () => {
      const cartId = localStorage.getItem(CART_KEY);

      if (!cartId) return;

      await fetchCart(cartId);
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

    const cartId = await getActiveCartId();

    if (!cartId) {
      throw new Error('No active cart');
    }

    const res = await apiFetch(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        variantId,
        quantity,
      }),
    });

    if (!res) {
      setLoading(false);

      if (openDrawer) {
        setOpen(false);
      }

      throw new Error('Connection error');
    }

    if (!res.ok) {
      setLoading(false);

      if (openDrawer) {
        setOpen(false);
      }

      const data = await res.json().catch(() => null);

      throw new Error(data?.error || 'No se pudo añadir al carrito');
    }

    const cart = await res.json();

    setItems(mapItems(cart));
    setLoading(false);
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (itemId: string) => {
    // UI optimista
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    await apiFetch(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
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
    cartIdRef.current = null;
    localStorage.removeItem(CART_KEY);
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
