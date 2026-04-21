"use client";

import { useEffect, useMemo, useState } from "react";
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
import { io } from "socket.io-client";

/* ================= TYPES ================= */

type Metrics = {
  todayOrders: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  refundedAmount: number;
  revenue7d: RevenuePoint[];
  revenue30d: RevenuePoint[];
};

type RevenuePoint = {
  date: string;
  revenue: number;
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

/* ================= COMPONENT ================= */

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const [countries, setCountries] = useState<Country[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [m, c, a] = await Promise.all([
        apiFetch("/dashboard/metrics"),
        apiFetch("/dashboard/sales-by-country"),
        apiFetch("/orders/activity-feed"),
      ]);

      if (m?.ok) setMetrics(await m.json());

      if (c?.ok) {
        const data = await c.json();
        setCountries(Array.isArray(data) ? data : data.data ?? []);
      }

      if (a?.ok) {
        const data = await a.json();
        setActivity(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
  };

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      withCredentials: true,
    });

    socket.on("dashboard:update", () => {
      console.log("🔄 Dashboard update recibido");
      loadAll();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= REVENUE ================= */

  const revenueData = useMemo(() => {
    if (!metrics) return [];

    const raw =
      range === "7d"
        ? metrics.revenue7d ?? []
        : metrics.revenue30d ?? [];

    return raw.map((d) => ({
      date: d.date.slice(5),
      revenue: Number((d.revenue / 100).toFixed(2)),
    }));
  }, [metrics, range]);

  /* ================= GROWTH ================= */

  const growth = useMemo(() => {
    if (revenueData.length < 2) return 0;

    const last = revenueData[revenueData.length - 1].revenue;
    const prev = revenueData[revenueData.length - 2].revenue;

    if (prev === 0) return 0;

    return ((last - prev) / prev) * 100;
  }, [revenueData]);

  if (!metrics) return <p>Cargando...</p>;

  return (
    <div className="space-y-8">

      {/* ================= ALERTS ================= */}
      {(metrics.refundedAmount > 10000 || growth < -20) && (
        <div className="space-y-2">
          {metrics.refundedAmount > 10000 && (
            <Alert text="Alto volumen de reembolsos detectado" />
          )}
          {growth < -20 && (
            <Alert text="Caída fuerte en ingresos recientes" />
          )}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-3 py-1 text-xs rounded ${
                range === r
                  ? "bg-white text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ================= KPIs ================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Revenue" value={format(metrics.totalRevenue)} />
        <Card title="Hoy" value={format(metrics.todayRevenue)} />
        <Card title="Pedidos" value={metrics.totalOrders} />
        <Card title="Hoy" value={metrics.todayOrders} />
        <Card title="Refunds" value={format(metrics.refundedAmount)} danger />
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-neutral-900 p-6 rounded-2xl">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm text-neutral-400">Revenue</h3>

          <span className={growth >= 0 ? "text-green-400" : "text-red-400"}>
            {growth >= 0 ? "▲" : "▼"} {growth.toFixed(1)}%
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#222" />
              <XAxis dataKey="date" stroke="#888" />
              <Tooltip />
              <Area dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SALES BY COUNTRY */}
        <div className="bg-neutral-900 p-6 rounded-2xl">
          <h3 className="text-sm text-neutral-400 mb-4">
            Sales by country
          </h3>

          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={countries}>
                <XAxis dataKey="country" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-neutral-900 p-6 rounded-2xl">
          <h3 className="text-sm text-neutral-400 mb-4">
            Activity
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activity.map((a, i) => {
              const map = {
                ORDER_CREATED: ["🛒", "text-blue-400", "Nueva orden"],
                PAYMENT_SUCCEEDED: ["💳", "text-green-400", "Pago completado"],
                REFUND_CREATED: ["💸", "text-red-400", "Reembolso creado"],
                REFUND_COMPLETED: ["💰", "text-yellow-400", "Reembolso completado"],
              } as any;

              const [icon, color, text] =
                map[a.type] || ["📦", "text-neutral-400", a.message];

              return (
                <div
                  key={a.id ?? i}
                  className="flex gap-3 border-b border-white/10 pb-2"
                >
                  <span>{icon}</span>

                  <div>
                    <p className={`text-sm ${color}`}>
                      {text} {a.orderId?.slice(0, 6) ?? ""}
                    </p>

                    <p className="text-xs text-neutral-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= UI ================= */

function Card({ title, value, danger }: any) {
  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-white/10">
      <p className="text-xs text-neutral-400">{title}</p>
      <p className={`text-xl font-bold ${danger ? "text-red-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Alert({ text }: { text: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
      ⚠ {text}
    </div>
  );
}

function format(n: number) {
  return "€" + (n / 100).toFixed(2);
}