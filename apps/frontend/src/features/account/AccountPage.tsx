"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/lib/api";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        /* =========================
           CHECK AUTH (SIN ROLE CHECK ❗)
        ========================= */

        const authRes = await apiFetch("/auth/me");

        if (!authRes) {
          window.location.href = "/login";
          return;
        }

        const authData = await authRes.json();

        if (!authData?.user) {
          window.location.href = "/login";
          return;
        }

        /* =========================
           FETCH ORDERS
        ========================= */

        const res = await apiFetch("/orders/me");

        if (!res) return;

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-400">Cargando tu cuenta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Mi cuenta</h1>
          <p className="text-neutral-400 text-sm mt-2">
            Aquí puedes ver tus pedidos recientes
          </p>
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="border border-white/10 rounded-xl p-8 text-center">
            <p className="text-neutral-400 mb-4">No tienes pedidos todavía</p>
            <a
              href="/shop"
              className="inline-block bg-white text-black px-4 py-2 rounded-lg text-sm"
            >
              Ir a la tienda
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Pedido</p>
                    <p className="font-semibold">#{order.id.slice(0, 6)}</p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      order.status === "PAID" ? "bg-green-600" : "bg-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-lg font-bold">
                    €{(order.totalAmount / 100).toFixed(2)}
                  </p>
                </div>

                <div className="mt-4">
                  <a
                    href={`/orders/${order.id}`}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Ver pedido →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
