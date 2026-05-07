"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { Mail, Search, ShoppingBag, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Customer = {
  email: string;
  fullName: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/customers");

        if (!res || !res.ok) throw new Error();

        const data = await res.json();

        setCustomers(Array.isArray(data) ? data : (data.data ?? []));
      } catch {
        console.error("Error cargando customers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    if (!Array.isArray(customers)) return [];

    const query = search.trim().toLowerCase();

    return customers.filter((c) =>
      `${c.email} ${c.fullName}`.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const totalSpent = useMemo(
    () => customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    [customers],
  );

  if (loading) return <CustomersSkeleton />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              CRM
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Clientes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              Gestiona tus clientes, identifica compradores frecuentes y revisa su última actividad.
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/25 focus:bg-white/[0.06]"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Clientes" value={customers.length} />
        <StatCard icon={ShoppingBag} label="Pedidos" value={customers.reduce((sum, c) => sum + c.ordersCount, 0)} />
        <StatCard icon={Mail} label="Total gastado" value={format(totalSpent)} />
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 md:hidden">
        {filtered.map((c) => (
          <article key={c.email} className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                <UserRound size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{c.fullName || "Cliente sin nombre"}</p>
                <p className="truncate text-sm text-neutral-500">{c.email}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <CustomerMetric label="Pedidos" value={c.ordersCount} />
              <CustomerMetric label="Gastado" value={format(c.totalSpent)} />
              <CustomerMetric label="Última" value={formatDate(c.lastOrderDate)} />
            </div>
          </article>
        ))}
      </div>

      {/* TABLE */}
      <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-xl shadow-black/20 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-neutral-500">
              <tr>
                <th className="p-4 text-left font-medium">Cliente</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Pedidos</th>
                <th className="p-4 text-left font-medium">Total gastado</th>
                <th className="p-4 text-left font-medium">Última compra</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => (
                <tr key={c.email} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                  <td className="p-4 font-medium text-white">{c.fullName || "Cliente sin nombre"}</td>
                  <td className="p-4 text-neutral-400">{c.email}</td>
                  <td className="p-4 text-neutral-200">{c.ordersCount}</td>
                  <td className="p-4 font-semibold text-emerald-300">{format(c.totalSpent)}</td>
                  <td className="p-4 text-neutral-400">{formatDate(c.lastOrderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <p className="font-medium text-neutral-200">No se encontraron clientes</p>
          <p className="mt-2 text-sm text-neutral-500">Prueba con otro nombre o correo electrónico.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20">
      <Icon size={18} className="text-neutral-500" />
      <p className="mt-4 text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function CustomerMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/[0.05] p-3">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-white">{value}</p>
    </div>
  );
}

function CustomersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-3xl bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/[0.06]" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" />
    </div>
  );
}

function format(n: number) {
  return "€" + (n / 100).toFixed(2);
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
