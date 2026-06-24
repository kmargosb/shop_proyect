'use client';

import { apiFetch } from '@/shared/lib/api';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import { Heart, LogOut, Package, Settings, Shield, User } from 'lucide-react';

type Props = {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function AccountSidebar({ user, activeTab, setActiveTab }: Props) {
  const { t } = useLanguage();
  const menuItems = [
    {
      key: 'profile',
      label: t.account.profile,
      icon: User,
    },
    {
      key: 'orders',
      label: t.account.orders,
      icon: Package,
    },
    {
      key: 'wishlist',
      label: t.account.wishlist,
      icon: Heart,
    },
    {
      key: 'security',
      label: t.account.security,
      icon: Shield,
    },
    {
      key: 'settings',
      label: t.account.settings,
      icon: Settings,
    },
  ];
  return (
    <aside className="h-full overflow-hidden rounded-l-none rounded-r-3xl border border-white/10 bg-neutral-950/95 p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:rounded-3xl">
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm text-neutral-500">{t.account.title}</p>

        <h1 className="mt-2 text-2xl font-bold">
          {t.account.welcome}, {user?.name || user?.email?.split('@')[0]}
        </h1>

        <p className="mt-2 text-sm text-neutral-500">{t.account.description}</p>
      </div>

      <div className="mt-5 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 border-t border-white/10 pt-6">
        <button
          onClick={async () => {
            await apiFetch('/auth/logout', {
              method: 'POST',
            });

            localStorage.removeItem('orderEmail');
            localStorage.removeItem('orderEmailOrderId');
            localStorage.removeItem('checkoutData');

            window.location.href = '/';
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={18} />
          {t.account.signOut}
        </button>
      </div>
    </aside>
  );
}
