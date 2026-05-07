"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { apiFetch } from "@/shared/lib/api";

const CART_KEY = "cartId";

/* ================= TYPES ================= */

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  setOpen: (value: boolean) => void;

  addItem: (productId: string, quantity?: number) => Promise<void>;
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
  const [open, setOpen] = useState(false);

  /* ================= HELPERS ================= */

  const mapItems = (cart: any): CartItem[] =>
    (cart.items ?? [])
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name ?? "Producto",
        price: item.price,
        quantity: item.quantity,
        image: item.product?.images?.[0]?.url || null,
      }));

  /* ================= CREATE CART ================= */

  const createCart = async (): Promise<string | null> => {
    const res = await apiFetch("/cart", { method: "POST" });

    if (!res || !res.ok) return null;

    const cart = await res.json();
    localStorage.setItem(CART_KEY, cart.id);

    return cart.id;
  };

  /* ================= ENSURE CART ================= */

  const ensureCart = async (): Promise<string | null> => {
    let cartId = localStorage.getItem(CART_KEY);

    if (cartId) return cartId;

    return await createCart();
  };

  /* ================= FETCH CART ================= */

  const fetchCart = async (cartId: string) => {
    const res = await apiFetch(`/cart/${cartId}`);
    if (!res || !res.ok) return;

    const cart = await res.json();
    setItems(mapItems(cart));
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

  /* ================= ADD ITEM ================= */

  const addItem = async (productId: string, quantity = 1) => {
    const cartId = await ensureCart();
    if (!cartId) return;

    const res = await apiFetch(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res) {
      throw new Error("Error de conexión");
    }

    if (!res.ok) {
      const data = await res.json().catch(() => null);

      throw new Error(data?.error || "No se pudo añadir al carrito");
    }

    const cart = await res.json();
    setItems(mapItems(cart));
    setOpen(true);
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (itemId: string) => {
    // UI optimista
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    await apiFetch(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  };

  /* ================= INCREASE ================= */

  const increaseQuantity = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const cartId = await ensureCart();
    if (!cartId) return;

    const res = await apiFetch(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({
        productId: item.productId,
        quantity: 1,
      }),
    });

    if (!res || !res.ok) return;

    const cart = await res.json();
    setItems(mapItems(cart));
  };

  /* ================= DECREASE ================= */

  const decreaseQuantity = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const cartId = await ensureCart();
    if (!cartId) return;

    if (item.quantity === 1) {
      await removeItem(itemId);
      return;
    }

    const res = await apiFetch(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({
        productId: item.productId,
        quantity: -1,
      }),
    });

    if (!res || !res.ok) return;

    const cart = await res.json();
    setItems(mapItems(cart));
  };

  /* ================= CLEAR ================= */

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  };

  /* ================= TOTALS ================= */

  const totalItems = items.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0,
  );

  const totalPrice = items.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        open,
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
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
