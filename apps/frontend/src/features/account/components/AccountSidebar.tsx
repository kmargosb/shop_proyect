"use client";

import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  User,
} from "lucide-react";

import { apiFetch } from "@/shared/lib/api";

const menuItems = [
  {
    key: "orders",
    label: "Pedidos",
    icon: Package,
  },
  {
    key: "profile",
    label: "Perfil",
    icon: User,
  },
  {
    key: "addresses",
    label: "Direcciones",
    icon: MapPin,
  },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    key: "security",
    label: "Seguridad",
    icon: Shield,
  },
  {
    key: "settings",
    label: "Configuración",
    icon: Settings,
  },
];

type Props = {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function AccountSidebar({
  user,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <aside
  className="
    h-full overflow-hidden border border-white/10
    bg-neutral-950/95 p-5 backdrop-blur-xl

    rounded-r-3xl
    rounded-l-none

    lg:sticky lg:top-0
    lg:rounded-3xl
  "
>
      <div className="border-b border-white/10 pb-5">
        <p className="text-sm text-neutral-500">Cuenta</p>

        <h1 className="mt-2 text-2xl font-bold">
          Hola, {user?.email?.split("@")[0]}
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Gestiona pedidos, direcciones y preferencias.
        </p>
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
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:bg-white/10 hover:text-white"
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
            await apiFetch("/auth/logout", {
              method: "POST",
            });

            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}