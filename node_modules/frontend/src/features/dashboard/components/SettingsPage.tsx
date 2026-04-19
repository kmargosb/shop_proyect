"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    setLoadingLogout(true);

    try {
      await apiFetch("/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      toast.error("Error cerrando sesión");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoadingLogoutAll(true);

    try {
      await apiFetch("/auth/logout-all", { method: "POST" });
      window.location.href = "/login";
    } catch {
      toast.error("Error cerrando todas las sesiones");
    } finally {
      setLoadingLogoutAll(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* TITLE */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-neutral-400 text-sm">
          Gestiona tu cuenta y seguridad
        </p>
      </div>

      {/* ================= ACCOUNT ================= */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium">Cuenta</h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogout}
            disabled={loadingLogout}
            className="w-full sm:w-fit px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-sm"
          >
            {loadingLogout ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>

          <button
            onClick={handleLogoutAll}
            disabled={loadingLogoutAll}
            className="w-full sm:w-fit px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition text-sm"
          >
            {loadingLogoutAll
              ? "Cerrando todas..."
              : "Cerrar sesión en todos los dispositivos"}
          </button>
        </div>
      </div>

      {/* ================= SECURITY ================= */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium">Seguridad</h2>

        <p className="text-sm text-neutral-400">
          Próximamente podrás cambiar tu contraseña y gestionar sesiones activas.
        </p>
      </div>

      {/* ================= SYSTEM ================= */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium">Sistema</h2>

        <p className="text-sm text-neutral-400">
          Más configuraciones avanzadas estarán disponibles aquí.
        </p>
      </div>
    </div>
  );
}