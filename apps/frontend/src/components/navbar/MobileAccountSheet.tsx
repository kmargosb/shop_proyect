'use client';

import { motion, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useLogout } from './hooks/useLogout';

type MobileAccountSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileAccountSheet({ open, onClose }: MobileAccountSheetProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const { t } = useLanguage();

  useBodyScrollLock(open);

  return (
    <>
      {/* BACKDROP */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        } `}
      />

      {/* SHEET */}

      <motion.div
        drag="y"
        dragDirectionLock
        dragElastic={0.12}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        onDragEnd={(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
          const shouldClose = info.offset.y > 120 || info.velocity.y > 500;

          if (shouldClose) {
            onClose();
          }
        }}
        className={`fixed bottom-0 left-0 z-[100] h-auto max-h-[90vh] w-full rounded-t-3xl bg-white transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* HANDLE */}

        <div className="flex justify-center py-4">
          <div className="h-1.5 w-12 rounded-full bg-neutral-300" />
        </div>

        {/* CONTENT */}

        <div className="px-6 pb-8">
          <div className="mx-4 rounded-3xl border border-black/5 bg-neutral-50 p-5">
            <p className="text-[11px] tracking-[0.25em] text-neutral-400 uppercase">
              {t.navbar.account}
            </p>

            <p className="mt-2 text-lg font-semibold text-black">
              {user?.name || user?.email?.split('@')[0]}
            </p>

            <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/account?tab=profile"
              onClick={onClose}
              className="flex items-center justify-between py-4"
            >
              <span>{t.navbar.myAccount}</span>
              <span>→</span>
            </Link>
            <Link
              href="/account?tab=orders"
              onClick={onClose}
              className="flex items-center justify-between py-4"
            >
              <span>{t.navbar.orders}</span>
              <span>→</span>
            </Link>

            <Link
              href="/account?tab=wishlist"
              onClick={onClose}
              className="flex items-center justify-between py-4"
            >
              <span>{t.navbar.wishlist}</span>
              <span>→</span>
            </Link>
            <Link
              href="/account?tab=security"
              onClick={onClose}
              className="flex items-center justify-between py-4"
            >
              <span>{t.navbar.security}</span>
              <span>→</span>
            </Link>
            <Link
              href="/account?tab=settings"
              onClick={onClose}
              className="flex items-center justify-between py-4"
            >
              <span>{t.navbar.settings}</span>
              <span>→</span>
            </Link>
            {user?.role === 'ADMIN' && (
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="block flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-600 hover:bg-emerald-400/20"
                >
                  <span>{t.navbar.adminPanel}</span>
                  <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-bold tracking-wide text-black uppercase">
                    Admin
                  </span>
                </Link>
              </div>
            )}
            <button
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="mt-6 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left font-medium text-red-600 transition hover:bg-red-100"
            >
              {t.navbar.logout}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
