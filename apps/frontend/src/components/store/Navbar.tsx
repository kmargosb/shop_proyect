"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useEffect, useState } from "react";
import { useNavbar } from "@/hooks/useNavbar";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { items, setOpen } = useCart();
  const { user, isAuthenticated } = useAuth();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const setNavbarVisible = useNavbar((s) => s.setVisible);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 80) {
        setVisible(false);
        setNavbarVisible(false);
      } else {
        setVisible(true);
        setNavbarVisible(true);
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll, setNavbarVisible]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300
      ${visible ? "translate-y-0" : "-translate-y-full"}
      bg-white backdrop-blur border-neutral-800`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="font-bold text-xl text-black">
          Koky Store
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-black">
          <Link href="/shop" className="hover:text-neutral-500">
            Shop
          </Link>

          <Link href="/brands" className="hover:text-neutral-500">
            Brands
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6">
          {/* USER */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 text-sm text-black">
              <span className="hidden sm:block">
                Hola, {user?.name?.split(" ")[0]}
              </span>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
                className="text-xs text-neutral-500 hover:text-black"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm hover:text-neutral-500">
              Login
            </Link>
          )}

          {/* CART */}
          <button onClick={() => setOpen(true)} className="relative">
            <ShoppingCart size={24} />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
