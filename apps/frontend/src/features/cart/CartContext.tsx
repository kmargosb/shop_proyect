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

/* ============================================
   TYPES
============================================ */

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  setOpen: (value: boolean) => void;

  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;

  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

/* ============================================
   PROVIDER
============================================ */

export function CartProvider({ children }: { children: ReactNode }) {

  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  /* ============================================
     CREATE CART
  ============================================ */

  const createCart = async (): Promise<string | null> => {

    const res = await apiFetch("/cart", {
      method: "POST",
    });

    if (!res || !res.ok) {
      console.error("Failed to create cart");
      return null;
    }

    const cart = await res.json();

    localStorage.setItem(CART_KEY, cart.id);

    return cart.id;
  };

  /* ============================================
     ENSURE CART EXISTS
  ============================================ */

  const ensureCart = async (): Promise<string | null> => {

    let cartId = localStorage.getItem(CART_KEY);

    if (cartId) {
      return cartId;
    }

    cartId = await createCart();

    return cartId;
  };

  /* ============================================
     FETCH CART
  ============================================ */

  const fetchCart = async (cartId: string) => {

    const res = await apiFetch(`/cart/${cartId}`);

    if (!res || !res.ok) return;

    const cart = await res.json();

    if (!cart) return;

    /* sincronizar cartId si backend devuelve otro */

    if (cart.id && cart.id !== cartId) {
      localStorage.setItem(CART_KEY, cart.id);
      cartId = cart.id;
    }

    const mappedItems: CartItem[] = (cart.items ?? []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product?.name ?? "Producto",
      price: item.price,
      quantity: item.quantity,
    }));

    setItems(mappedItems);
  };

  /* ============================================
     INIT CART
  ============================================ */

  useEffect(() => {

    const init = async () => {

      const cartId = await ensureCart();

      if (!cartId) return;

      await fetchCart(cartId);
    };

    init();

  }, []);

  /* ============================================
     ADD ITEM
  ============================================ */

  const addItem = async (productId: string, quantity = 1) => {

    let cartId = await ensureCart();

    if (!cartId) {
      console.error("Cart not available");
      return;
    }

    console.log("ADDING TO CART", cartId, productId);

    const res = await apiFetch(`/cart/${cartId}/items`, {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });

    if (!res || !res.ok) {
      console.error("Failed to add item");
      return;
    }

    const cart = await res.json();

    /* sincronizar cartId si backend creó uno nuevo */

    if (cart.id && cart.id !== cartId) {
      localStorage.setItem(CART_KEY, cart.id);
      cartId = cart.id;
    }

    const mappedItems: CartItem[] = (cart.items ?? []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product?.name ?? "Producto",
      price: item.price,
      quantity: item.quantity,
    }));

    setItems(mappedItems);

    setOpen(true);
  };

  /* ============================================
     REMOVE ITEM
  ============================================ */

  const removeItem = async (itemId: string) => {

    const cartId = localStorage.getItem(CART_KEY);

    if (!cartId) return;

    /* actualización optimista */

    setItems((prev) => prev.filter((item) => item.id !== itemId));

    const res = await apiFetch(`/cart/items/${itemId}`, {
      method: "DELETE",
    });

    if (!res || !res.ok) {
      console.error("Failed to remove item");
    }
  };

  /* ============================================
     CLEAR CART
  ============================================ */

  const clearCart = () => {

    setItems([]);

    localStorage.removeItem(CART_KEY);
  };

  /* ============================================
     TOTALS
  ============================================ */

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ============================================
   HOOK
============================================ */

export function useCart() {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}