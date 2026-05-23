"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/shared/lib/api";
import type { Order, OrderStatus } from "@/types/order";
import StatusBadge from "./StatusBadge";
import RefundModal from "./RefundModal";
import ShipmentModal from "./ShipmentModal";
import QuickViewModal from "./QuickViewModal";
import {
  formatMoney,
  CustomerPreview,
  OrderTimeline,
  ActionTile,
  safeNumber,
} from "./order-ui";
import { socket } from "@/shared/lib/socket";

type FilterStatus = "ALL" | OrderStatus;

const PAGE_SIZE = 8;
const STATUSES: FilterStatus[] = [
  "ALL",
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "FAILED",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await apiFetch("/orders?limit=100");
      if (!res || !res.ok) throw new Error("Orders request failed");
      const data: unknown = await res.json();
      setOrders(parseOrders(data));
    } catch {
      toast.error("Error cargando órdenes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
  loadOrders();

  socket.on("orderUpdated", () => {
    loadOrders();
  });

  return () => {
    socket.off("orderUpdated");
  };
}, []);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const searchable =
        `${order.id} ${order.fullName} ${order.email} ${order.phone}`.toLowerCase();
      if (filter !== "ALL" && order.status !== filter) return false;
      if (query && !searchable.includes(query)) return false;
      return true;
    });
  }, [orders, search, filter]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const stats = useMemo(() => buildOrderStats(orders), [orders]);
  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await apiFetch(`/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res || !res.ok) throw new Error("Update order failed");
      toast.success("Orden actualizada");
      await loadOrders();
    } catch {
      toast.error("Error actualizando");
    }
  };
  const cancelOrder = async (id: string) => {
    try {
      const res = await apiFetch(`/orders/${id}/cancel`, {
        method: "POST",
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      toast.success("Pedido cancelado");

      await loadOrders();

      setSelectedOrder(null);
    } catch {
      toast.error("No se pudo cancelar");
    }
  };

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="w-full min-w-0 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_32%),linear-gradient(135deg,#111111,#070707)] p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Operaciones
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Órdenes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Monitorea pagos, envíos, incidencias y acciones futuras de
              facturas o reembolsos con una vista rápida profesional.
            </p>
          </div>
          <button
            onClick={loadOrders}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />{" "}
            Actualizar
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <OrderStat
          icon={CreditCard}
          label="Revenue capturado"
          value={formatMoney(stats.revenue)}
          helper={`${stats.paid} pagadas`}
          tone="emerald"
        />
        <OrderStat
          icon={Clock3}
          label="Pendientes"
          value={stats.pending}
          helper="Requieren pago/seguimiento"
          tone="amber"
        />
        <OrderStat
          icon={Truck}
          label="Enviadas"
          value={stats.shipped}
          helper="Tracking preparado"
          tone="sky"
        />
        <OrderStat
          icon={RotateCcw}
          label="Refunds"
          value={stats.refunded}
          helper="Arquitectura lista"
          tone="rose"
        />
      </div>

      <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por orden, cliente, email o teléfono..."
              className="dashboard-input pl-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold transition ${filter === status ? "bg-white text-black" : "border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-white"}`}
              >
                {statusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:hidden">
        {paginated.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            onOpen={setSelectedOrder}
            onMarkPaid={() => updateStatus(order.id, "PAID")}
            onDelivered={async () => {
              try {
                const res = await apiFetch(
                  `/shipping/${order.shipment!.id}/status`,
                  {
                    method: "PATCH",

                    headers: {
                      "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                      status: "DELIVERED",
                    }),
                  },
                );

                if (!res || !res.ok) {
                  throw new Error();
                }

                toast.success("Pedido entregado");

                await loadOrders();
              } catch {
                toast.error("No se pudo actualizar");
              }
            }}
          />
        ))}
      </div>

      <section className="hidden min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/80 shadow-xl shadow-black/20 xl:block">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="p-4 text-left font-medium">Orden</th>
                <th className="p-4 text-left font-medium">Cliente</th>
                <th className="p-4 text-left font-medium">Timeline</th>
                <th className="p-4 text-left font-medium">Total</th>
                <th className="p-4 text-left font-medium">Estado</th>
                <th className="p-4 text-left font-medium">Fecha</th>
                <th className="p-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-white/10 transition hover:bg-white/[0.04]"
                >
                  <td className="p-4">
                    <p className="font-semibold text-white">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {order.items?.length ?? 0} items
                    </p>
                  </td>
                  <td className="p-4">
                    <CustomerPreview order={order} />
                  </td>
                  <td className="p-4">
                    <OrderTimeline status={order.status} />
                  </td>
                  <td className="p-4 font-semibold text-white">
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-neutral-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-xl border border-white/10 p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
                        title="Vista rápida"
                      >
                        <Eye size={15} />
                      </button>
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(order.id, "PAID")}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200"
                        >
                          Marcar paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {filtered.length === 0 && <EmptyOrders />}
      {filtered.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          onPage={setPage}
        />
      )}
      {selectedOrder && (
        <QuickViewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCreateShipment={() => setShipmentOrder(selectedOrder)}
          onCancel={() => cancelOrder(selectedOrder.id)}
          onRefresh={loadOrders}
          onOpenRefund={() => setRefundOrder(selectedOrder)}
        />
      )}
      {shipmentOrder && (
        <ShipmentModal
          order={shipmentOrder}
          onClose={() => setShipmentOrder(null)}
          onSuccess={async () => {
            await loadOrders();

            setSelectedOrder(null);
          }}
        />
      )}
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onSuccess={loadOrders}
        />
      )}
    </div>
  );
}

function parseOrders(data: unknown): Order[] {
  if (Array.isArray(data)) return data.filter(isOrderLike);
  if (typeof data === "object" && data !== null && "data" in data) {
    const payload = (data as { data?: unknown }).data;
    return Array.isArray(payload) ? payload.filter(isOrderLike) : [];
  }
  return [];
}
function isOrderLike(value: unknown): value is Order {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "status" in value
  );
}
function buildOrderStats(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      if (
        order.status === "PAID" ||
        order.status === "SHIPPED" ||
        order.status === "DELIVERED"
      ) {
        acc.revenue += safeNumber(order.totalAmount);
        acc.paid += 1;
      }
      if (order.status === "PENDING") acc.pending += 1;
      if (order.status === "SHIPPED") acc.shipped += 1;
      if (order.status === "REFUNDED" || order.status === "PARTIALLY_REFUNDED")
        acc.refunded += 1;
      return acc;
    },
    { revenue: 0, paid: 0, pending: 0, shipped: 0, refunded: 0 },
  );
}
function statusLabel(status: FilterStatus) {
  return status === "ALL"
    ? "Todas"
    : status.replace("PARTIALLY_", "PART. ").toLowerCase();
}
function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
function OrderStat({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper: string;
  tone: "emerald" | "amber" | "rose" | "sky";
}) {
  const tones = {
    emerald: "text-emerald-300 bg-emerald-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    rose: "text-rose-300 bg-rose-400/10",
    sky: "text-sky-300 bg-sky-400/10",
  };
  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5 shadow-xl shadow-black/20">
      <div className={`inline-flex rounded-2xl p-3 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{helper}</p>
    </div>
  );
}
function OrderMobileCard({
  order,
  onOpen,
  onMarkPaid,
  onDelivered,
}: {
  order: Order;
  onOpen: (order: Order) => void;
  onMarkPaid: () => void;
  onDelivered: () => void;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20">
      <button onClick={() => onOpen(order)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">#{order.id.slice(0, 8)}</p>
            <p className="text-sm text-neutral-500">{order.fullName}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 text-xs min-[420px]:grid-cols-3">
          <Metric label="Total" value={formatMoney(order.totalAmount)} />
          <Metric label="Items" value={order.items?.length ?? 0} />
          <Metric label="Fecha" value={formatDate(order.createdAt)} />
        </div>
      </button>
      {order.status === "PENDING" && (
        <button
          onClick={onMarkPaid}
          className="mt-4 w-full rounded-2xl bg-emerald-300 px-3 py-2 text-sm font-semibold text-black"
        >
          Marcar como pagada
        </button>
      )}
      {order.shipment?.status === "SHIPPED" && (
        <button
          onClick={onDelivered}
          className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200"
        >
          Marcar entregado
        </button>
      )}
    </article>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-3">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-white">{value}</p>
    </div>
  );
}
function EmptyOrders() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
      <PackageCheck className="mx-auto text-neutral-600" size={34} />
      <p className="mt-4 font-semibold text-neutral-200">
        No hay órdenes para esta vista
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Cambia filtros o búsqueda para ver otros pedidos.
      </p>
    </div>
  );
}
function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-neutral-950/80 p-4 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {total} resultados · Página {page} de {totalPages}
      </span>
      <div className="flex w-full gap-2 sm:w-auto">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex-1 rounded-xl border border-white/10 p-2 disabled:opacity-40 sm:flex-none"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex-1 rounded-xl border border-white/10 p-2 disabled:opacity-40 sm:flex-none"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-44 animate-pulse rounded-3xl bg-white/[0.06]" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl bg-white/[0.06]"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-white/[0.06]" />
    </div>
  );
}
