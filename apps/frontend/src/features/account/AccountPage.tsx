"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";

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

  useEffect(() => {
    async function loadData() {
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
    }

    loadData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-neutral-400">Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white md:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
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
    fixed left-0 top-0 z-50 h-screen w-[300px]
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
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white"
          >
            <Menu size={18} />
            Menú cuenta
          </button>
        </div>
        <section className="space-y-6">
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
