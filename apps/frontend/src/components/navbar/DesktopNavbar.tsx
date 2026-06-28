'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { useCartUI } from '@/features/cart/CartUIContext';
import { useEffect, useRef, useState } from 'react';
import { useNavbar } from '@/hooks/useNavbar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import Image from 'next/image';
import { apiFetch } from '@/shared/lib/api';

export default function DesktopNavbar() {
  const { items } = useCart();
  const { openCart } = useCartUI();
  const { user, isAuthenticated, loading } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll, setNavbarVisible]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return null;

  return (
    <header
      className={`fixed top-0 left-0 z-50 hidden w-full transition-transform duration-300 md:block ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } bg-white`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LOGO */}

        <Link href="/">
          <Image
            src="/brands/camarguette/CamarguetteLogo.png"
            alt="Camarguette"
            width={220}
            height={80}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* CENTER */}

        <nav className="flex items-center gap-8 text-sm">
          <Link href="/shop">{t.navbar.shop}</Link>

          <Link href="/brands">{t.navbar.brands}</Link>
        </nav>

        {/* RIGHT */}

        <div className="flex items-center gap-6">
          {/* LANG */}

          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setLocale('en')}
              className={locale === 'en' ? 'font-semibold' : 'text-neutral-400'}
            >
              EN
            </button>

            <span>|</span>

            <button
              onClick={() => setLocale('es')}
              className={locale === 'es' ? 'font-semibold' : 'text-neutral-400'}
            >
              ES
            </button>
          </div>

          {/* USER */}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setOpenDropdown((p) => !p)} className="text-sm">
                {user?.name || user?.email?.split('@')[0]}
              </button>

              <div
                className={`absolute right-0 mt-3 w-72 origin-top-right overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl transition-all duration-200 ${
                  openDropdown
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
                }`}
              >
                {/* HEADER */}

                <div className="border-b border-black/5 p-5">
                  <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase">
                    {t.navbar.account}
                  </p>

                  <p className="mt-2 text-lg font-semibold text-black">
                    {user?.name || user?.email?.split('@')[0]}
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
                    <span>{t.navbar.myAccount}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=orders"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>{t.navbar.orders}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=addresses"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>{t.navbar.addresses}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>{t.navbar.wishlist}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=security"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>{t.navbar.security}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  <Link
                    href="/account?tab=settings"
                    onClick={() => setOpenDropdown(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-black transition hover:bg-neutral-100"
                  >
                    <span>{t.navbar.settings}</span>
                    <span className="text-neutral-400">→</span>
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <div className="px-2 pt-3">
                      <Link
                        href="/dashboard"
                        onClick={() => setOpenDropdown(false)}
                        className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-400/20"
                      >
                        <span>{t.navbar.adminPanel}</span>

                        <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold tracking-wide text-black uppercase">
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

                      await apiFetch('/auth/logout', {
                        method: 'POST',
                      });

                      localStorage.removeItem('orderEmail');
                      localStorage.removeItem('orderEmailOrderId');
                      localStorage.removeItem('checkoutData');

                      window.location.href = '/';
                    }}
                    className="w-full cursor-pointer rounded-2xl px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
                  >
                    {t.navbar.logout}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">{t.navbar.login}</Link>
          )}

          {/* CART */}

          <button onClick={openCart} className="relative">
            <ShoppingCart size={24} />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full bg-black px-2 py-1 text-xs text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
