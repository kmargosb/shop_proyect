"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
           CHECK AUTH + ROLE 🔥
        ========================= */

        const authRes = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!authRes.ok) {
          window.location.href = "/login";
          return;
        }

        const authData = await authRes.json();

        // 🔥 SOLO USERS (NO ADMIN)
        if (authData.user.role !== "USER") {
          window.location.href = "/login";
          return;
        }

        /* =========================
           FETCH ORDERS
        ========================= */

        const res = await fetch(`${API_URL}/orders/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Error fetching orders");
          return;
        }

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
    return <div className="p-10 text-white">Cargando pedidos...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Mi cuenta</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400">No tienes pedidos todavía</p>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Pedido</p>
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
  );
}
