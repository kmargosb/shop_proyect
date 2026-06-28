'use client';

import { createContext, useContext, useState } from 'react';

type CartUIContextType = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartUIContext = createContext<CartUIContextType | null>(null);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);

  const closeCart = () => setIsOpen(false);

  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartUIContext.Provider
      value={{
        isOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartUIContext);

  if (!context) {
    throw new Error('useCartUI must be used inside CartUIProvider');
  }

  return context;
}
