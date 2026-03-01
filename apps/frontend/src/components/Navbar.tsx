"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";

export default function Navbar() {
  const { items, setOpen } = useCart();

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <header className="border-b border-gray-800 p-4 flex justify-between">
      <h1 className="font-bold text-xl">
        Koky Store 🛒
      </h1>

      <button
        onClick={() => setOpen(true)}
        className="relative"
      >
        <ShoppingCart size={26} />

        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full">
            {totalItems}
          </span>
        )}
      </button>
    </header>
  );
}