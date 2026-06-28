'use client';

import { CartProvider } from '@/features/cart/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistProvider } from '@/features/wishlist/WishListContext';
import CartDrawer from '@/features/cart/components/CartDrawer';
import { CartUIProvider } from '@/features/cart/CartUIContext';

const queryClient = new QueryClient();

export default function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <CartUIProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </CartUIProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
