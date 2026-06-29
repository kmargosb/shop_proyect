'use client';

import Link from 'next/link';
import CartButton from './components/CartButton';
import { useAuth } from '@/features/auth/context/AuthContext';
import MobileAccountSheet from './MobileAccountSheet';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import LanguageSwitcher from './components/LanguageSwitcher';

export default function MobileNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollRef = useRef(0);
  const tickingRef = useRef(false);
  const visibleRef = useRef(true);
  const latestScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      latestScrollRef.current = Math.max(0, window.scrollY);

      if (tickingRef.current) return;

      tickingRef.current = true;

      requestAnimationFrame(() => {
        if (sheetOpen) {
          tickingRef.current = false;
          return;
        }

        const currentScroll = latestScrollRef.current;

        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        const distanceToBottom = documentHeight - (currentScroll + viewportHeight);

        // Siempre visible arriba
        if (currentScroll <= 40) {
          if (!visibleRef.current) {
            visibleRef.current = true;
            setVisible(true);
          }

          lastScrollRef.current = currentScroll;
          tickingRef.current = false;
          return;
        }

        // Ignorar el rebote inferior de Safari
        if (distanceToBottom < 180) {
          lastScrollRef.current = currentScroll;
          tickingRef.current = false;
          return;
        }

        const delta = currentScroll - lastScrollRef.current;

        if (Math.abs(delta) >= 20) {
          const nextVisible = delta < 0;

          if (nextVisible !== visibleRef.current) {
            visibleRef.current = nextVisible;
            setVisible(nextVisible);
          }

          lastScrollRef.current = currentScroll;
        }

        tickingRef.current = false;
      });
    };
    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sheetOpen, visible]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transform-gpu bg-white transition-transform duration-300 will-change-transform md:hidden ${
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

          <LanguageSwitcher />

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
            <CartButton />
          </div>
        </div>
      </header>
      <MobileAccountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
