import { create } from "zustand";
import { CartItem } from "../types";

type CartState = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, qty: number) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (item) =>
  set((state) => {
    console.log("🛒 ADDING TO CART:", item);

    const existing = state.items.find(
      (i) => i.productId === item.productId
    );

    if (existing) {
      return {
        items: state.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      };
    }

    return { items: [...state.items, item] };
  }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),

  updateQuantity: (productId, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i
      ),
    })),

  clearCart: () => set({ items: [] }),
}));