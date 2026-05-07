"use client";

import { useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";
import {
  LogOut,
  MonitorSmartphone,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

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
    <div className="space-y-6">
      {/* TITLE */}
      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Configuración
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Ajustes del panel
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
          Gestiona la seguridad de tu cuenta administrativa y prepara las preferencias del sistema.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
        {/* ================= ACCOUNT ================= */}
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-300">
              <LogOut size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Cuenta</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Cierra la sesión actual o revoca todas las sesiones activas si sospechas de acceso no autorizado.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleLogout}
              disabled={loadingLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            >
              <LogOut size={16} />
              {loadingLogout ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>

            <button
              onClick={handleLogoutAll}
              disabled={loadingLogoutAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
            >
              <MonitorSmartphone size={16} />
              {loadingLogoutAll ? "Cerrando todas..." : "Cerrar sesión en todos"}
            </button>
          </div>
        </section>

        {/* ================= SECURITY ================= */}
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Seguridad</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                Próximamente podrás cambiar tu contraseña y gestionar sesiones activas desde aquí.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SYSTEM ================= */}
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-300">
                <Settings2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Sistema</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
                  Más configuraciones avanzadas estarán disponibles aquí para adaptar el panel al flujo operativo de la tienda.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-400">
              <SlidersHorizontal size={14} />
              Próximamente
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
