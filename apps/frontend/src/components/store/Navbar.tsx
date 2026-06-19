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
      className={`fixed top-0 left-0 z-50 w-full transition-transform duration-300
      ${visible ? "translate-y-0" : "-translate-y-full"}
      border-neutral-800 bg-white`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition hover:opacity-80"
        >
          <img
            src="/brands/camarguette/logo.png"
            alt="Camarguette"
            className="h-16 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-black md:flex">
          <Link href="/shop">Shop</Link>

          <Link href="/brands">Brands</Link>
        </nav>

        <div className="flex items-center gap-6">
          {/* USER */}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown((prev) => !prev)}
                className="text-sm text-black transition hover:opacity-70"
              >
                Hello, {user?.email?.split("@")[0]}
              </button>

              {/* DROPDOWN */}

              <div
                className={`absolute right-0 mt-3 w-72 origin-top-right overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl transition-all duration-200
                ${
                  openDropdown
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                }`}
              >
                {/* HEADER */}

                <div className="border-b border-black/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    Account
                  </p>

                  <p className="mt-2 text-lg font-semibold text-black">
                    {user?.email?.split("@")[0]}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
                </div>

                {/* LINKS */}

                <div className="p-2">
                  <Link
                    href="/account?tab=profile"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>My Account</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=orders"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>Orders</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=addresses"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>Addresses</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>Wishlist</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=security"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>Security</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=settings"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>Configurations</span>

                    <span className="text-neutral-400">→</span>
                  </Link>

                  {user?.role === "ADMIN" && (
                    <div className="px-2 pt-3">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpenDropdown(false)}
                        className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-400/20"
                      >
                        <span>Admin panel</span>

                        <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                          Admin
                        </span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div className="border-t border-black/5 p-2">
                  <button
                    onClick={async () => {
                      setOpenDropdown(false);

                      await apiFetch("/auth/logout", {
                        method: "POST",
                      });

                      localStorage.removeItem("orderEmail");
                      localStorage.removeItem("orderEmailOrderId");
                      localStorage.removeItem("checkoutData");

                      window.location.href = "/";
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
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
              <span className="absolute -right-2 -top-2 rounded-full bg-black px-2 py-1 text-xs text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
