'use client';

import { Menu } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMyOrders } from './hooks/useMyOrders';
import { useAuth } from '@/features/auth/context/AuthContext';
import { socket } from '@/shared/lib/socket';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import AccountSidebar from './components/AccountSidebar';
import OrdersTab from './components/OrdersTab';
import ProfileTab from './components/ProfileTab';
import WishlistTab from './components/WishlistTab';
import SecurityTab from './components/SecurityTab';
import SettingsTab from './components/SettingsTab';

export default function AccountPage() {
  const { user } = useAuth();
  const { data: orders = [], isPending: loading, refetch } = useMyOrders(!!user);
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const { t } = useLanguage();

  useEffect(() => {
    const refreshOrders = () => {
      void refetch();
    };

    socket.on('dashboard:update', refreshOrders);
    socket.on('orderUpdated', refreshOrders);

    return () => {
      socket.off('dashboard:update', refreshOrders);
      socket.off('orderUpdated', refreshOrders);
    };
  }, [refetch]);

  useEffect(() => {
    const tab = searchParams.get('tab');

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-neutral-400">{t.account.loading}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-72px)] overflow-hidden bg-black px-4 py-4 text-white md:px-6">
      <div className="mx-auto grid h-full max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <button
            aria-label={t.account.closeSidebar}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
        <div
          className={`fixed top-0 left-0 z-50 h-screen w-[85vw] max-w-[340px] transform transition-transform duration-300 lg:relative lg:h-auto lg:w-auto lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
        >
          <AccountSidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
          />
        </div>
        <div className="lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-950/90 px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition hover:bg-white/10"
          >
            <Menu size={18} />
            {t.account.menu}
          </button>
        </div>
        <section className="h-full overflow-y-auto pr-1 pb-10">
          {activeTab === 'orders' && <OrdersTab orders={orders} />}

          {activeTab === 'profile' && <ProfileTab user={user} orders={orders} />}

          {activeTab === 'wishlist' && <WishlistTab />}

          {activeTab === 'security' && <SecurityTab />}

          {activeTab === 'settings' && <SettingsTab />}
        </section>
      </div>
    </div>
  );
}
