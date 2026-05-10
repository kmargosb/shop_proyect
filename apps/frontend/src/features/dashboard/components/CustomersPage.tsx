"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Mail, Search, ShoppingBag, Sparkles, TrendingUp, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch } from "@/shared/lib/api";

type RawCustomer = {
  email?: unknown;
  fullName?: unknown;
  totalSpent?: unknown;
  ordersCount?: unknown;
  totalOrders?: unknown;
  lastOrderDate?: unknown;
  lastPurchase?: unknown;
};

type Customer = {
  email: string;
  fullName: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/customers?limit=100");
        if (!res || !res.ok) throw new Error("Customers request failed");
        const data: unknown = await res.json();
        setCustomers(parseCustomers(data));
      } catch (error) {
        console.error("Error cargando customers", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => `${customer.email} ${customer.fullName}`.toLowerCase().includes(query));
  }, [customers, search]);

  const analytics = useMemo(() => buildAnalytics(customers), [customers]);
  const topCustomers = useMemo(() => [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5), [customers]);
  const recentCustomers = useMemo(() => [...customers].sort((a, b) => dateValue(b.lastOrderDate) - dateValue(a.lastOrderDate)).slice(0, 5), [customers]);

  if (loading) return <CustomersSkeleton />;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),linear-gradient(135deg,#111111,#070707)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">CRM</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Clientes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">Analiza compradores, valor medio y actividad reciente con datos normalizados para evitar NaN o estados inconsistentes.</p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o email..." className="dashboard-input pl-11" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Clientes" value={analytics.totalCustomers} helper="Emails únicos" />
        <StatCard icon={ShoppingBag} label="Pedidos" value={analytics.totalOrders} helper="Histórico acumulado" />
        <StatCard icon={Mail} label="Total gastado" value={formatMoney(analytics.totalSpent)} helper="Revenue por clientes" />
        <StatCard icon={TrendingUp} label="AOV" value={formatMoney(analytics.averageOrderValue)} helper="Average order value" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.85fr)]">
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-semibold text-white">Customer analytics</h2><p className="mt-1 text-sm text-neutral-500">Distribución simple para detectar clientes de alto valor.</p></div>
            <Sparkles size={18} className="text-purple-300" />
          </div>
          <div className="mt-6 space-y-4">
            <Progress label="Clientes con pedidos repetidos" value={analytics.repeatRate} />
            <Progress label="Top customer share" value={analytics.topCustomerShare} />
            <Progress label="Actividad reciente" value={analytics.recentActivityRate} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3"><Award className="text-amber-300" size={18} /><h2 className="font-semibold text-white">Top customers</h2></div>
          <div className="mt-4 space-y-3">
            {topCustomers.length > 0 ? topCustomers.map((customer, index) => <CustomerRow key={customer.email} customer={customer} prefix={`#${index + 1}`} />) : <SmallEmpty text="Aún no hay clientes con compras." />}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-white">Clientes recientes</h2><span className="text-xs text-neutral-500">{recentCustomers.length} últimos</span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {recentCustomers.length > 0 ? recentCustomers.map((customer) => <RecentCustomer key={customer.email} customer={customer} />) : <SmallEmpty text="Sin actividad reciente." />}
        </div>
      </section>

      <div className="space-y-3 md:hidden">
        {filtered.map((customer) => <CustomerCard key={customer.email} customer={customer} />)}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-xl shadow-black/20 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-neutral-500">
              <tr><th className="p-4 text-left font-medium">Cliente</th><th className="p-4 text-left font-medium">Email</th><th className="p-4 text-left font-medium">Pedidos</th><th className="p-4 text-left font-medium">AOV</th><th className="p-4 text-left font-medium">Total gastado</th><th className="p-4 text-left font-medium">Última compra</th></tr>
            </thead>
            <tbody>{filtered.map((customer) => <CustomerTableRow key={customer.email} customer={customer} />)}</tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center"><p className="font-medium text-neutral-200">No se encontraron clientes</p><p className="mt-2 text-sm text-neutral-500">Prueba con otro nombre o correo electrónico.</p></div>}
    </div>
  );
}

function parseCustomers(data: unknown): Customer[] {
  const payload = Array.isArray(data) ? data : typeof data === "object" && data !== null && "data" in data ? (data as { data?: unknown }).data : [];
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeCustomer).filter((customer): customer is Customer => customer !== null);
}

function normalizeCustomer(raw: unknown): Customer | null {
  if (typeof raw !== "object" || raw === null) return null;
  const customer = raw as RawCustomer;
  const email = safeString(customer.email);
  if (!email) return null;
  const fallbackName = email.split("@")[0] || "Cliente sin nombre";
  return {
    email,
    fullName: safeString(customer.fullName) || fallbackName,
    totalSpent: safeNumber(customer.totalSpent),
    ordersCount: safeNumber(customer.ordersCount ?? customer.totalOrders),
    lastOrderDate: safeNullableString(customer.lastOrderDate ?? customer.lastPurchase),
  };
}

function safeString(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function safeNullableString(value: unknown) { const text = safeString(value); return text || null; }
function safeNumber(value: unknown) { return typeof value === "number" && Number.isFinite(value) ? value : Number.isFinite(Number(value)) ? Number(value) : 0; }
function dateValue(date: string | null) { if (!date) return 0; const value = new Date(date).getTime(); return Number.isNaN(value) ? 0 : value; }
function buildAnalytics(customers: Customer[]) { const totalCustomers = customers.length; const totalOrders = customers.reduce((sum, c) => sum + c.ordersCount, 0); const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0); const topSpent = customers.reduce((max, c) => Math.max(max, c.totalSpent), 0); const recent = customers.filter((c) => Date.now() - dateValue(c.lastOrderDate) < 1000 * 60 * 60 * 24 * 30).length; return { totalCustomers, totalOrders, totalSpent, averageOrderValue: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0, repeatRate: totalCustomers > 0 ? Math.round((customers.filter((c) => c.ordersCount > 1).length / totalCustomers) * 100) : 0, topCustomerShare: totalSpent > 0 ? Math.round((topSpent / totalSpent) * 100) : 0, recentActivityRate: totalCustomers > 0 ? Math.round((recent / totalCustomers) * 100) : 0 }; }
function formatMoney(cents: number) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(safeNumber(cents) / 100); }
function formatDate(date: string | null) { if (!date) return "—"; const parsed = new Date(date); return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }); }
function customerAov(customer: Customer) { return customer.ordersCount > 0 ? Math.round(customer.totalSpent / customer.ordersCount) : 0; }
function StatCard({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: string | number; helper: string }) { return <div className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20"><Icon size={18} className="text-neutral-500" /><p className="mt-4 text-sm text-neutral-400">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-neutral-500">{helper}</p></div>; }
function Progress({ label, value }: { label: string; value: number }) { const safe = Math.max(0, Math.min(100, safeNumber(value))); return <div><div className="flex justify-between text-sm"><span className="text-neutral-400">{label}</span><span className="font-semibold text-white">{safe}%</span></div><div className="mt-2 h-2 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-emerald-300" style={{ width: `${safe}%` }} /></div></div>; }
function CustomerRow({ customer, prefix }: { customer: Customer; prefix: string }) { return <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] p-3"><div className="flex min-w-0 items-center gap-3"><span className="text-xs font-semibold text-neutral-500">{prefix}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{customer.fullName}</p><p className="truncate text-xs text-neutral-500">{customer.email}</p></div></div><span className="shrink-0 text-sm font-semibold text-emerald-300">{formatMoney(customer.totalSpent)}</span></div>; }
function RecentCustomer({ customer }: { customer: Customer }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><UserRound size={17} className="text-neutral-500" /><p className="mt-3 truncate font-semibold text-white">{customer.fullName}</p><p className="truncate text-xs text-neutral-500">{customer.email}</p><p className="mt-3 text-xs text-neutral-400">Última: {formatDate(customer.lastOrderDate)}</p></div>; }
function CustomerCard({ customer }: { customer: Customer }) { return <article className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black"><UserRound size={18} /></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-white">{customer.fullName}</p><p className="truncate text-sm text-neutral-500">{customer.email}</p></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Metric label="Pedidos" value={customer.ordersCount} /><Metric label="AOV" value={formatMoney(customerAov(customer))} /><Metric label="Gastado" value={formatMoney(customer.totalSpent)} /></div></article>; }
function CustomerTableRow({ customer }: { customer: Customer }) { return <tr className="border-t border-white/10 transition hover:bg-white/[0.04]"><td className="p-4 font-medium text-white">{customer.fullName}</td><td className="p-4 text-neutral-400">{customer.email}</td><td className="p-4 text-neutral-200">{customer.ordersCount}</td><td className="p-4 text-neutral-200">{formatMoney(customerAov(customer))}</td><td className="p-4 font-semibold text-emerald-300">{formatMoney(customer.totalSpent)}</td><td className="p-4 text-neutral-400">{formatDate(customer.lastOrderDate)}</td></tr>; }
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-white/[0.05] p-3"><p className="text-neutral-500">{label}</p><p className="mt-1 truncate font-semibold text-white">{value}</p></div>; }
function SmallEmpty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-neutral-500">{text}</div>; }
function CustomersSkeleton() { return <div className="space-y-4"><div className="h-44 animate-pulse rounded-3xl bg-white/[0.06]" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/[0.06]" />)}</div><div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" /></div>; }
