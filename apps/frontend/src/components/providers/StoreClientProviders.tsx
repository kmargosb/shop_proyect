'use client';

import { CartProvider } from '@/features/cart/CartContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { WishlistProvider } from '@/features/wishlist/WishListContext';
import CartDrawer from '@/features/cart/components/CartDrawer';
import { CartUIProvider } from '@/features/cart/CartUIContext';

export default function StoreClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <CartUIProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </CartUIProvider>
    </GoogleOAuthProvider>
  );
}
