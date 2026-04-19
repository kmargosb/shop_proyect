"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useEffect, useRef, useState } from "react";
import { useNavbar } from "@/hooks/useNavbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { apiFetch } from "@/shared/lib/api";

export default function Navbar() {
  const { items, setOpen } = useCart();
  const { user, isAuthenticated, loading } = useAuth();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const setNavbarVisible = useNavbar((s) => s.setVisible);

  /* ================= SCROLL ================= */

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

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= ESC CLOSE ================= */

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300
      ${visible ? "translate-y-0" : "-translate-y-full"}
      bg-white border-neutral-800`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-black">
          Koky Store
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-black">
          <Link href="/shop">Shop</Link>
          <Link href="/brands">Brands</Link>
        </nav>

        <div className="flex items-center gap-6">
          {/* USER */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown((prev) => !prev)}
                className="text-sm text-black hover:opacity-70 transition"
              >
                Hola, {user?.email?.split("@")[0]}
              </button>

              {/* DROPDOWN */}
              <div
                className={`absolute right-0 mt-3 w-52 rounded-xl border bg-white shadow-lg overflow-hidden
                transition-all duration-200 origin-top-right
                ${
                  openDropdown
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <Link
                  href="/account"
                  onClick={() => setOpenDropdown(false)}
                  className="block px-4 py-3 hover:bg-gray-100 transition"
                >
                  Mi cuenta
                </Link>

                {user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpenDropdown(false)}
                    className="block px-4 py-3 hover:bg-gray-100 transition"
                  >
                    Admin panel
                  </Link>
                )}

                <div className="h-px bg-gray-200" />

                <button
                  onClick={async () => {
                    setOpenDropdown(false);
                    await apiFetch("/auth/logout", {
                      method: "POST",
                    });
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-sm">
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
