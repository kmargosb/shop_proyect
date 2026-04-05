"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";
import { toast } from "sonner";
import OrderDetailModal from "@/features/orders/components/OrderDetailModal";
import type { Order } from "@/types/order";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ================= LOAD ================= */

  const loadOrders = async () => {
    try {
      const res = await apiFetch("/orders");

      if (!res || !res.ok) throw new Error();

      const data = await res.json();
      setOrders(data.data ?? []);
    } catch {
      toast.error("Error cargando órdenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= ACTIONS ================= */

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res || !res.ok) throw new Error();

      toast.success("Orden actualizada");
      loadOrders();
    } catch {
      toast.error("Error actualizando");
    }
  };

  /* ================= FILTER ================= */

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <p>Cargando órdenes...</p>;

  return (
    <div className="space-y-6 w-full">
      {/* HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <h2 className="text-lg font-semibold">Órdenes</h2>

        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-xs ${
                filter === s ? "bg-white text-black" : "bg-white/10 text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="lg:hidden space-y-3">
        {filtered.map((o) => (
          <div key={o.id} className="border border-white/[0.08] rounded-xl p-4">
            <div onClick={() => setSelectedOrder(o)} className="cursor-pointer">
              <p className="font-medium">#{o.id.slice(0, 6)}</p>

              <p className="text-xs text-white/50">{o.fullName}</p>

              <p className="text-xs text-white/50">
                €{((o.totalAmount ?? 0) / 100).toFixed(2)}
              </p>

              <p className="text-xs mt-1">
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs bg-white/10 px-2 py-1 rounded">
                {o.status}
              </span>

              {o.status === "PENDING" && (
                <button
                  onClick={() => updateStatus(o.id, "PAID")}
                  className="text-xs text-green-400"
                >
                  PAID
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= TABLET ================= */}
      <div className="hidden md:block lg:hidden overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="text-white/50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-t border-white/[0.08] cursor-pointer"
                onClick={() => setSelectedOrder(o)}
              >
                <td className="p-3">#{o.id.slice(0, 6)}</td>
                <td className="p-3">{o.fullName}</td>
                <td className="p-3">
                  €{((o.totalAmount ?? 0) / 100).toFixed(2)}
                </td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:block overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead className="text-white/50">
            <tr>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-t border-white/[0.08] cursor-pointer"
                onClick={() => setSelectedOrder(o)}
              >
                <td className="p-4">{o.fullName}</td>
                <td className="p-4">{o.email}</td>
                <td className="p-4">
                  €{((o.totalAmount ?? 0) / 100).toFixed(2)}
                </td>
                <td className="p-4">{o.status}</td>
                <td className="p-4">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
