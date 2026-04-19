"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

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

  /* ================= NAV ================= */

  const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: Package }, // ✅ FIX
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

  /* ================= ACTIVE FIX ================= */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"; // 👈 exact match SOLO dashboard
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white">
      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-[#0A0A0A]
          border-r border-white/10
          p-6 flex flex-col justify-between
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* TOP */}
        <div>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-semibold">Dashboard</h2>

            <button className="lg:hidden" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                    ${
                      active
                        ? "bg-white text-black"
                        : "text-neutral-400 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="text-xs text-neutral-500">
          Admin Panel © {new Date().getFullYear()}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col lg:ml-64 h-screen">
        {/* HEADER */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>

          <h1 className="text-sm text-neutral-400">
            {pathname.startsWith("/dashboard/orders") && "Orders"}
            {pathname.startsWith("/dashboard/settings") && "Settings"}
            {pathname === "/dashboard" && "Dashboard"}
          </h1>

          <div className="text-xs text-neutral-500">Admin</div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}