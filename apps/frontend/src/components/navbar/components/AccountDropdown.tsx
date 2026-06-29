'use client';

import Link from 'next/link';
import type { User } from '@/features/auth/types';
import { useLanguage } from '@/shared/i18n/LanguageContext';

type Props = {
  user: User;
  open: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

export default function AccountDropdown({ user, open, onClose, onLogout }: Props) {
  const { t } = useLanguage();

  return (
    <div
      className={`absolute right-0 mt-3 w-72 origin-top-right overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl transition-all duration-200 ${
        open
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
      }`}
    >
      <div className="border-b border-black/5 p-5">
        <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase">{t.navbar.account}</p>

        <p className="mt-2 text-lg font-semibold text-black">
          {user?.name || user?.email?.split('@')[0]}
        </p>

        <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
      </div>

      <div className="p-2">
        <Link
          href="/account?tab=profile"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.myAccount}</span>
          <span>→</span>
        </Link>

        <Link
          href="/account?tab=orders"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.orders}</span>
          <span>→</span>
        </Link>

        <Link
          href="/account?tab=addresses"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.addresses}</span>
          <span>→</span>
        </Link>

        <Link
          href="/account?tab=wishlist"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.wishlist}</span>
          <span>→</span>
        </Link>

        <Link
          href="/account?tab=security"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.security}</span>
          <span>→</span>
        </Link>

        <Link
          href="/account?tab=settings"
          onClick={onClose}
          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
        >
          <span>{t.navbar.settings}</span>
          <span>→</span>
        </Link>

        {user?.role === 'ADMIN' && (
          <div className="px-2 pt-3">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-600"
            >
              <span>{t.navbar.adminPanel}</span>

              <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold text-black uppercase">
                Admin
              </span>
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-black/5 p-2">
        <button
          onClick={onLogout}
          className="w-full rounded-2xl px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
        >
          {t.navbar.logout}
        </button>
      </div>
    </div>
  );
}
