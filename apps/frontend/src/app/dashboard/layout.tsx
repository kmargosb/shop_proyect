"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import {
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  Search,
  Settings,
  Tags,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ReceiptText },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Brands", href: "/dashboard/brands", icon: Tags },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  /* ================= AUTH ================= */

  useEffect(() => {
    const checkSession = async () => {
      const res = await apiFetch("/auth/me");

      if (!res) {
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (!data?.user || data.user.role !== "ADMIN") {
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  /* ================= ACTIVE FIX ================= */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  const currentPage =
    navItems.find((item) => isActive(item.href))?.name ?? "Dashboard";

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#070707] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_28%)]" />

      {/* OVERLAY */}
      {open && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72 flex-col justify-between
          border-r border-white/10 bg-neutral-950/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* TOP */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-lg shadow-white/10">
                <Store size={20} />
              </span>
              <span>
                <span className="block text-base font-semibold tracking-tight">
                  Store Admin
                </span>
                <span className="text-xs text-neutral-500">
                  Panel profesional
                </span>
              </span>
            </Link>

            <button
              aria-label="Cerrar menú"
              className="rounded-xl p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <ShieldCheck size={15} />
              Sesión administrativa
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              Acceso seguro para gestionar catálogo, ventas y clientes.
            </p>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition
                    ${
                      active
                        ? "bg-white text-black shadow-lg shadow-white/10"
                        : "text-neutral-400 hover:bg-white/[0.08] hover:text-white"
                    }
                  `}
                >
                  <Icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-neutral-500">
          <p className="font-medium text-neutral-300">Admin Panel</p>
          <p className="mt-1">© {new Date().getFullYear()} · Tienda online</p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#070707]/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                Panel
              </p>
              <h1 className="text-sm font-semibold text-white sm:text-base">
                {currentPage}
              </h1>
            </div>
          </div>

          <div className="hidden w-full max-w-sm items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-neutral-500 md:flex">
            <Search size={16} />
            <span>Busca y gestiona tu tienda desde cada sección</span>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-300">
            Admin
          </div>
        </header>

        {/* CONTENT */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6 lg:py-6 2xl:px-8 2xl:py-8">
          <div className="mx-auto w-full min-w-0 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
