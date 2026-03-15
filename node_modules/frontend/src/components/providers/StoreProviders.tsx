"use client";

import { CartProvider } from "@/features/cart/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";

export default function StoreProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}