'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLogout } from './hooks/useLogout';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import AccountDropdown from './components/AccountDropdown';
import CartButton from './components/CartButton';
import Image from 'next/image';
import { useNavbarScroll } from './hooks/useNavbarScroll';

export default function DesktopNavbar() {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const visible = useNavbarScroll();

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

          <LanguageSwitcher />

          {/* USER */}

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setOpenDropdown((p) => !p)} className="text-sm">
                {user?.name || user?.email?.split('@')[0]}
              </button>
              <AccountDropdown
                user={user!}
                open={openDropdown}
                onClose={() => setOpenDropdown(false)}
                onLogout={async () => {
                  setOpenDropdown(false);
                  await logout();
                }}
              />
            </div>
          ) : (
            <Link href="/login">{t.navbar.login}</Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
