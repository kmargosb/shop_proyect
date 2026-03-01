"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  open: boolean;
  setOpen: (value: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  /* =========================
     ADD ITEM
  ========================= */

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  /* =========================
     REMOVE
  ========================= */

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  /* =========================
     EVENT LISTENER GLOBAL
  ========================= */

  useEffect(() => {
    const handler = (e: any) => {
      addItem(e.detail);
      setOpen(true);
    };

    window.addEventListener("add-to-cart", handler);

    return () =>
      window.removeEventListener("add-to-cart", handler);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addItem,
        removeItem,
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
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}