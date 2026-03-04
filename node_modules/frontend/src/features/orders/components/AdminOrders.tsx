"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import OrderDetailModal from "@/features/orders/components/OrderDetailModal";
import type { Order } from "@/types/order";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ======================================================
     LOAD ORDERS
  ====================================================== */

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

  /* ======================================================
     UPDATE STATUS
  ====================================================== */

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res || !res.ok) throw new Error();

      toast.success("Orden actualizada");
      loadOrders();
    } catch {
      toast.error("No se pudo actualizar");
    }
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const renderActions = (order: Order) => {
    if (order.status === "PENDING") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus(order.id, "PAID")}
            className="bg-green-600 px-3 py-1 rounded text-xs"
          >
            Marcar PAID
          </button>

          <button
            onClick={() => updateStatus(order.id, "CANCELLED")}
            className="bg-red-600 px-3 py-1 rounded text-xs"
          >
            Cancelar
          </button>
        </div>
      );
    }

    if (order.status === "PAID") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus(order.id, "SHIPPED")}
            className="bg-purple-600 px-3 py-1 rounded text-xs"
          >
            Marcar SHIPPED
          </button>

          <button
            onClick={() => updateStatus(order.id, "CANCELLED")}
            className="bg-red-600 px-3 py-1 rounded text-xs"
          >
            Cancelar
          </button>
        </div>
      );
    }

    return <span className="text-gray-500 text-xs">Sin acciones</span>;
  };

  if (loading) return <p className="text-white">Cargando órdenes...</p>;

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  /* ======================================================
     METRICS
  ====================================================== */

  const paidRevenue = orders
    .filter((o) => o.status === "PAID")
    .reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* ================= METRICS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm text-gray-400">Total órdenes</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm text-gray-400">Ventas reales (PAID)</p>
          <p className="text-2xl font-bold">
            €{(paidRevenue / 100).toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm text-gray-400">Canceladas</p>
          <p className="text-2xl font-bold">
            {orders.filter((o) => o.status === "CANCELLED").length}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold">Órdenes</h2>

      {/* ================= FILTERS ================= */}

      <div className="flex gap-3">
        {["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded text-sm ${
              filter === status
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Stripe</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-gray-800 hover:bg-gray-800/40 transition"
              >
                <td
                  className="p-4 cursor-pointer text-blue-400 hover:underline"
                  onClick={() => setSelectedOrder(order)}
                >
                  {order.fullName}
                </td>

                <td className="p-4">{order.email}</td>

                <td className="p-4">
                  €{((order.totalAmount ?? 0) / 100).toFixed(2)}
                </td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === "PENDING"
                        ? "bg-yellow-600"
                        : order.status === "PAID"
                          ? "bg-green-600"
                          : order.status === "SHIPPED"
                            ? "bg-purple-600"
                            : "bg-red-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4 text-xs">
                  {order.stripePaymentIntentId ? (
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      Ver pago
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-4">{renderActions(order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ORDER MODAL ================= */}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
