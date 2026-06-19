"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { apiFetch } from "@/shared/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";

type WishlistItem = {
  id: string;
  productId: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext =
  createContext<WishlistContextType | null>(null);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    const res = await apiFetch("/wishlist");

    if (!res || !res.ok) {
      return;
    }

    const data = await res.json();

    setItems(
      data.map((item: any) => ({
        id: item.id,
        productId: item.productId,
      })),
    );
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isWishlisted = (productId: string) => {
    return items.some(
      (item) => item.productId === productId,
    );
  };

  const toggleWishlist = async (
    productId: string,
  ) => {
    const exists = isWishlisted(productId);

    if (exists) {
      await apiFetch(`/wishlist/${productId}`, {
        method: "DELETE",
      });

      setItems((prev) =>
        prev.filter(
          (item) => item.productId !== productId,
        ),
      );

      return;
    }

    await apiFetch(`/wishlist/${productId}`, {
      method: "POST",
    });

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId,
      },
    ]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isWishlisted,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider",
    );
  }

  return context;
}