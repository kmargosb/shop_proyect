"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  YAxis,
} from "recharts";
import { socket } from "@/shared/lib/socket";
import { COUNTRIES } from "@/shared/constants/countries";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CreditCard,
  Globe2,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ConversionFunnel from "./ConversionFunnel";
import TopProductsAnalytics from "../components/TopProductsAnalytics";

/* ================= TYPES ================= */

type Metrics = {
  period: string;
  averageTicket: number;
  todayOrders: number;
  todayGrossRevenue: number;
  todayRefunded: number;
  todayNetRevenue: number;
  totalOrders: number;
  grossRevenue: number;
  netRevenue: number;
  refundedAmount: number;
  revenue7d: RevenuePoint[];
  revenue30d: RevenuePoint[];
  revenue90d?: RevenuePoint[];
};

type FinancialSummary = {
  period: string;
  grossRevenue: number;
  refundedAmount: number;
  netRevenue: number;
  totalOrders: number;
  averageTicket: number;
};

type RevenuePoint = {
  date: string;
  grossRevenue: number;
  refunded: number;
  netRevenue: number;
};

type Country = {
  country: string;
  revenue: number;
};

type Activity = {
  id: string;
  type: string;
  createdAt: string;
  message?: string;
  orderId?: string;
};

type Range = "7d" | "30d" | "90d";

type KpiCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  accent: string;
  trend?: number;
  danger?: boolean;
};

/* ================= COMPONENT ================= */

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [financialPeriod, setFinancialPeriod] = useState<
    "day" | "month" | "year" | "total"
  >("total");
  const [countries, setCountries] = useState<Country[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [funnel, setFunnel] = useState({
    views: 0,
    addToCart: 0,
    checkoutStarted: 0,
    purchases: 0,
    addToCartRate: 0,
    checkoutRate: 0,
    purchaseRate: 0,
  });
  const [topProducts, setTopProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ================= LOAD ================= */
  const loadAll = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [m, c, a, f, p] = await Promise.all([
        apiFetch("/dashboard/metrics"),
        apiFetch("/dashboard/sales-by-country"),
        apiFetch("/orders/activity-feed"),
        apiFetch("/analytics/funnel"),
        apiFetch("/analytics/top-products"),
      ]);

      if (m?.ok) setMetrics(await m.json());

      if (c?.ok) {
        const data = await c.json();
        setCountries(Array.isArray(data) ? data : (data.data ?? []));
      }

      if (a?.ok) {
        const data = await a.json();
        setActivity(Array.isArray(data) ? data : (data.data ?? []));
      }
      if (f?.ok) {
        setFunnel(await f.json());
      }
      if (p?.ok) {
        setTopProducts(await p.json());
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loadFinancialSummary = useCallback(async () => {
    try {
      const res = await apiFetch(
        `/dashboard/financial-summary?period=${financialPeriod}`,
      );

      if (!res?.ok) return;

      setFinancialSummary(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, [financialPeriod]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    loadFinancialSummary();
  }, [loadFinancialSummary]);

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    const refreshDashboard = () => {
      void loadAll();
      void loadFinancialSummary();
    };

    socket.on("dashboard:update", refreshDashboard);
    socket.on("orderUpdated", refreshDashboard);

    return () => {
      socket.off("dashboard:update", refreshDashboard);
      socket.off("orderUpdated", refreshDashboard);
    };
  }, [loadAll]);

  /* ================= REVENUE ================= */

  const revenueData = useMemo(() => {
    if (!metrics) return [];

    const rawByRange: Record<Range, RevenuePoint[]> = {
      "7d": metrics.revenue7d ?? [],
      "30d": metrics.revenue30d ?? [],
      "90d": metrics.revenue90d ?? metrics.revenue30d ?? [],
    };

    return rawByRange[range].map((d) => ({
      date: formatDateLabel(d.date),
      grossRevenue: Number((d.grossRevenue / 100).toFixed(2)),
      refunded: Number((d.refunded / 100).toFixed(2)),
      netRevenue: Number((d.netRevenue / 100).toFixed(2)),
    }));
  }, [metrics, range]);

  const countriesFormatted = useMemo(() => {
    return countries
      .map((c) => ({
        ...c,
        country: COUNTRIES.find((x) => x.code === c.country)?.name || c.country,
        revenue: Number((c.revenue / 100).toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [countries]);

  /* ================= GROWTH ================= */

  const growth = useMemo(() => {
    if (revenueData.length < 2) return 0;

    const last = revenueData[revenueData.length - 1].netRevenue;
    const prev = revenueData[revenueData.length - 2].netRevenue;

    if (prev === 0) return 0;

    return ((last - prev) / prev) * 100;
  }, [revenueData]);

  const conversionHint = useMemo(() => {
    if (!metrics?.totalOrders || !metrics.netRevenue)
      return "Sin datos todavía";
    return `${format(metrics.netRevenue / metrics.totalOrders)} ticket medio`;
  }, [metrics]);

  const financialData = financialSummary ?? {
    grossRevenue: 0,
    refundedAmount: 0,
    netRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
  };

  const averageTicketSelected = financialData.averageTicket;

  if (!metrics) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ================= HERO ================= */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.28),transparent_34%),linear-gradient(135deg,#111111,#080808)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-neutral-300">
              <Sparkles size={14} className="text-indigo-300" />
              Panel en tiempo real para decisiones de tienda
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Resumen comercial
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                Supervisa ingresos, pedidos, reembolsos, mercados principales y
                actividad reciente sin salir del panel.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
              {(["7d", "30d", "90d"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                    range === r
                      ? "bg-white text-black shadow-lg shadow-white/10"
                      : "text-neutral-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                loadAll();
                loadFinancialSummary();
              }}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      {/* ================= ALERTS ================= */}
      {(metrics.refundedAmount > 10000 || growth < -20) && (
        <div className="grid gap-3 md:grid-cols-2">
          {metrics.refundedAmount > 10000 && (
            <Alert text="Alto volumen de reembolsos detectado" />
          )}
          {growth < -20 && <Alert text="Caída fuerte en ingresos recientes" />}
        </div>
      )}

      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="Ingresos netos hoy"
          value={format(metrics.todayNetRevenue)}
          description="Después de devoluciones"
          icon={CalendarDays}
          accent="from-emerald-400/20 to-emerald-400/5 text-emerald-300"
        />
        <KpiCard
          title="Ingresos brutos hoy"
          value={format(metrics.todayGrossRevenue)}
          description="Antes de devoluciones"
          icon={Banknote}
          accent="from-sky-400/20 to-sky-400/5 text-sky-300"
        />
        <KpiCard
          title="Reembolsos hoy"
          value={format(metrics.todayRefunded)}
          description="Devuelto hoy"
          icon={CreditCard}
          accent="from-rose-400/20 to-rose-400/5 text-rose-300"
          danger={metrics.todayRefunded > 0}
        />
        <KpiCard
          title="Pedidos hoy"
          value={metrics.todayOrders}
          description="Actividad diaria"
          icon={PackageCheck}
          accent="from-amber-400/20 to-amber-400/5 text-amber-300"
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6">
        <div className="mb-6 flex gap-2">
          {[
            ["total", "Total"],
            ["year", "Año"],
            ["month", "Mes"],
            ["day", "Día"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() =>
                setFinancialPeriod(value as "day" | "month" | "year" | "total")
              }
              className={
                financialPeriod === value
                  ? "rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                  : "rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Rendimiento financiero
        </h2>

        <p className="mb-6 text-sm text-neutral-500">
          Resumen de ingresos, reembolsos y rentabilidad.
        </p>
        {/* ================= Resumen Financiero ================= */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-neutral-500">Ventas brutas</p>

            <p className="mt-2 text-2xl font-semibold text-white">
              {format(financialData.grossRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-neutral-500">Reembolsado</p>

            <p className="mt-2 text-2xl font-semibold text-red-300">
              {format(financialData.refundedAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-neutral-500">Beneficio neto</p>

            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {format(financialData.netRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm text-neutral-500">Ticket medio</p>

            <p className="mt-2 text-2xl font-semibold text-indigo-300">
              {format(averageTicketSelected)}
            </p>
          </div>
        </div>
        <div className="md:hidden mt-6 overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-white/10">
                <td className="px-5 py-4 text-neutral-400">Ventas brutas</td>

                <td className="px-5 py-4 text-right font-medium text-white">
                  {format(financialData.grossRevenue)}
                </td>
              </tr>

              <tr className="border-b border-white/10">
                <td className="px-5 py-4 text-neutral-400">Reembolsos</td>

                <td className="px-5 py-4 text-right font-medium text-red-300">
                  -{format(financialData.refundedAmount)}
                </td>
              </tr>

              <tr className="border-b border-white/10">
                <td className="px-5 py-4 text-neutral-400">Ingresos netos</td>

                <td className="px-5 py-4 text-right font-medium text-emerald-300">
                  {format(financialData.netRevenue)}
                </td>
              </tr>

              <tr>
                <td className="px-5 py-4 text-neutral-400">Ticket medio</td>

                <td className="px-5 py-4 text-right font-medium text-indigo-300">
                  {format(averageTicketSelected)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-6">
        <ConversionFunnel funnel={funnel} />
        <TopProductsAnalytics products={topProducts} />
      </div>

      {/* ================= CHART ================= */}
      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Revenue
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Ingresos por periodo
            </h2>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              growth >= 0
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {growth >= 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {growth.toFixed(1)}%
          </div>
        </div>

        <div className="h-72 sm:h-80">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ left: 0, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#737373"
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const label =
                      String(name) === "grossRevenue"
                        ? "Ventas brutas"
                        : String(name) === "netRevenue"
                          ? "Ingresos netos"
                          : "Reembolsos";
                    return [`€${Number(value).toFixed(2)}`, label];
                  }}
                  contentStyle={{
                    background: "rgba(10,10,10,0.96)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "16px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#a3a3a3" }}
                />
                <Area
                  type="monotone"
                  dataKey="grossRevenue"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#colorRev)"
                />

                <Area
                  type="monotone"
                  dataKey="netRevenue"
                  stroke="#34d399"
                  strokeWidth={3}
                  fillOpacity={0}
                />

                <Area
                  type="monotone"
                  dataKey="refunded"
                  stroke="#fb7185"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="Sin ingresos para mostrar"
              description="Cuando entren ventas, aparecerán en esta gráfica."
            />
          )}
        </div>
      </section>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        {/* SALES BY COUNTRY */}
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Mercados
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Ventas por país
              </h2>
            </div>
            <Globe2 className="text-neutral-500" size={22} />
          </div>

          <div className="h-72">
            {countriesFormatted.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countriesFormatted}
                  margin={{ left: 0, right: 8 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="country"
                    stroke="#737373"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#737373"
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `€${Number(value).toFixed(2)}`,
                      "Ventas",
                    ]}
                    contentStyle={{
                      background: "rgba(10,10,10,0.96)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#a3a3a3" }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#34d399"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sin países destacados"
                description="Las ventas por ubicación aparecerán aquí."
              />
            )}
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Timeline
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Actividad reciente
              </h2>
            </div>
            <ReceiptText className="text-neutral-500" size={22} />
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {activity.length > 0 ? (
              activity.map((item, index) => (
                <ActivityItem key={item.id ?? index} item={item} />
              ))
            ) : (
              <EmptyState
                title="Sin actividad reciente"
                description="Los eventos de pedidos y pagos aparecerán aquí."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= UI ================= */

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  trend,
  danger,
}: KpiCardProps) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-neutral-950/80 p-3 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/20 sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`rounded-xl bg-gradient-to-br p-2.5 ${accent} sm:rounded-2xl sm:p-3`}
        >
          <Icon size={20} />
        </div>

        {typeof trend === "number" && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend >= 0
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {trend.toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm text-neutral-400">{title}</p>
        <p
          className={`mt-2 text-lg font-semibold tracking-tight sm:text-2xl ${danger ? "text-rose-300" : "text-white"}`}
        >
          {value}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-neutral-500 sm:mt-2 sm:text-xs">
          {description}
        </p>
      </div>
    </article>
  );
}

function ActivityItem({ item }: { item: Activity }) {
  const map: Record<string, { icon: string; color: string; text: string }> = {
    ORDER_CREATED: { icon: "🛒", color: "text-sky-300", text: "Nueva orden" },
    PAYMENT_SUCCEEDED: {
      icon: "💳",
      color: "text-emerald-300",
      text: "Pago completado",
    },
    REFUND_CREATED: {
      icon: "💸",
      color: "text-rose-300",
      text: "Reembolso creado",
    },
    REFUND_COMPLETED: {
      icon: "💰",
      color: "text-amber-300",
      text: "Reembolso completado",
    },
  };

  const activity = map[item.type] || {
    icon: "📦",
    color: "text-neutral-300",
    text: item.message || "Actualización de tienda",
  };

  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
        {activity.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${activity.color}`}>
          {activity.text} {item.orderId ? `#${item.orderId.slice(0, 6)}` : ""}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function Alert({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-300" />
      <span>{text}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <p className="font-medium text-neutral-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-3xl bg-white/[0.06]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-3xl bg-white/[0.06]"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" />
    </div>
  );
}

function formatDateLabel(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date.slice(5);

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

function format(n: number) {
  return "€" + (n / 100).toFixed(2);
}
