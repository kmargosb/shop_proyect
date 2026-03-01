"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { CartItem, CartContextType } from "@/types/cart";

/* =========================
   CONTEXT
========================= */

const CartContext = createContext<CartContextType | null>(null);

/* =========================
   PROVIDER
========================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  /* =========================
     LOAD CART FROM STORAGE
  ========================= */

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  /* =========================
     SAVE CART
  ========================= */

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  /* =========================
     ADD ITEM
  ========================= */

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + item.quantity,
              }
            : p
        );
      }

      return [...prev, item];
    });
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeItem = (id: string) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* =========================
     CLEAR CART
  ========================= */

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  /* =========================
     TOTALS
  ========================= */

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  /* =========================
     GLOBAL ADD EVENT
  ========================= */

  useEffect(() => {
    const handler = (e: any) => {
      addItem({
        ...e.detail,
        quantity: 1,
      });

      setOpen(true);
    };

    window.addEventListener("add-to-cart", handler);

    return () =>
      window.removeEventListener("add-to-cart", handler);
  }, []);

  /* =========================
     PROVIDER VALUE
  ========================= */

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

/* =========================
   HOOK
========================= */

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}