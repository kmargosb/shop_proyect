'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/CartContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import MobileAccountSheet from './MobileAccountSheet';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function MobileNavbar() {
  const { items, setOpen } = useCart();
  const { locale, setLocale } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollRef = useRef(0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (sheetOpen) return;

      const currentScroll = window.scrollY;
      const lastScroll = lastScrollRef.current;

      // siempre visible arriba del todo
      if (currentScroll < 40) {
        setVisible(true);
        lastScrollRef.current = currentScroll;
        return;
      }

      // bajar
      if (currentScroll > lastScroll + 15) {
        setVisible(false);
      }

      // subir
      if (currentScroll < lastScroll - 15) {
        setVisible(true);
      }

      lastScrollRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sheetOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full bg-white transition-transform duration-300 md:hidden ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {/* LOGO */}

          <Link href="/">
            <Image
              src="/brands/camarguette/CamarguetteLogo.png"
              alt="Camarguette"
              width={220}
              height={80}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

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

          {/* USER + CART */}

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button onClick={() => setSheetOpen(true)} className="text-sm font-medium">
                {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
              </button>
            ) : (
              <Link href="/login" className="text-sm">
                Login
              </Link>
            )}

            <button onClick={() => setOpen(true)} className="relative">
              <ShoppingCart size={22} />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-black px-2 py-1 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <MobileAccountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
