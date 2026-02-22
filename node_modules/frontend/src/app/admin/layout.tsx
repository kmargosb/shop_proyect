"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  /* ===============================
     VERIFICAR SESIÓN AL MONTAR
  =============================== */

  useEffect(() => {
    const checkSession = async () => {
      const res = await apiFetch("/auth/me");

      if (!res) {
        // 🔥 Redirección limpia
        router.replace("/login");
      }
    };

    checkSession();
  }, [router]);

  /* ===============================
     LOGOUT NORMAL
  =============================== */

  const handleLogout = async () => {
    await apiFetch("/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
  };

  /* ===============================
     LOGOUT GLOBAL
  =============================== */

  const handleLogoutAll = async () => {
    await apiFetch("/auth/logout-all", {
      method: "POST",
    });

    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-50
          top-0 left-0 h-full w-64
          bg-gray-900 border-r border-gray-800 p-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">🧠 Admin</h2>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-3 text-sm">
          <Link href="/admin" className="block hover:text-blue-400">
            Dashboard
          </Link>

          <Link href="/admin" className="block hover:text-blue-400">
            Productos
          </Link>
        </nav>

        <div className="mt-6 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

          <button
            onClick={handleLogoutAll}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded"
          >
            Logout en todos los dispositivos
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>

          <h1 className="font-semibold">Panel Administración</h1>
        </header>

        <main className="p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}