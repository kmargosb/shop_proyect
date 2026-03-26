"use client";

import { CartProvider } from "@/features/cart/CartContext";
import CartDrawer from "@/features/cart/components/CartDrawer";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function StoreProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}