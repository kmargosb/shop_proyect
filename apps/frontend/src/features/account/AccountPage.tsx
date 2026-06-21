"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { socket } from "@/shared/lib/socket";

import AccountSidebar from "./components/AccountSidebar";
import OrdersTab from "./components/OrdersTab";
import ProfileTab from "./components/ProfileTab";
import AddressesTab from "./components/AddressesTab";
import WishlistTab from "./components/WishlistTab";
import SecurityTab from "./components/SecurityTab";
import SettingsTab from "./components/SettingsTab";

export type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;

  items: {
    id: string;
    quantity: number;

    size?: string;
    color?: string;

    product?: {
      name?: string;
      images?: {
        url: string;
      }[];
    };
  }[];
};

export default function AccountPage() {
  const { user } = useAuth();

  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "orders",
  );

  const loadData = useCallback(async () => {
    try {
      const authRes = await apiFetch("/auth/me");

      if (!authRes) {
        window.location.href = "/login";
        return;
      }

      const authData = await authRes.json();

      if (!authData?.user) {
        window.location.href = "/login";
        return;
      }

      const res = await apiFetch("/orders/me");

      if (!res) return;

      const data = await res.json();

      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const refreshOrders = () => {
      void loadData();
    };

    socket.on("dashboard:update", refreshOrders);
    socket.on("orderUpdated", refreshOrders);

    return () => {
      socket.off("dashboard:update", refreshOrders);
      socket.off("orderUpdated", refreshOrders);
    };
  }, [loadData]);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-neutral-400">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-72px)] overflow-hidden bg-black px-4 py-4 text-white md:px-6">
      <div className="mx-auto grid h-full max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <button
            aria-label="Cerrar sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
        )}
        <div
          className={`
    fixed left-0 top-0 z-50 h-screen w-[85vw] max-w-[340px]
    transform transition-transform duration-300
    lg:relative lg:h-auto lg:w-auto lg:translate-x-0
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
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
            Account Menu
          </button>
        </div>
        <section className="h-full overflow-y-auto pr-1 pb-10">
          {activeTab === "orders" && <OrdersTab orders={orders} />}

          {activeTab === "profile" && <ProfileTab user={user} />}

          {activeTab === "addresses" && <AddressesTab />}

          {activeTab === "wishlist" && <WishlistTab />}

          {activeTab === "security" && <SecurityTab />}

          {activeTab === "settings" && <SettingsTab />}
        </section>
      </div>
    </div>
  );
}
