"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchOrders() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/orders/me`, {
          method: "GET",
          credentials: "include", // 🔥 CLAVE
        });

        if (!res.ok) {
          console.error("Error fetching orders");
          return;
        }

        const data = await res.json();
        console.log("ORDERS RESPONSE:", res.status, data);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl">Debes iniciar sesión</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10 text-white">
      <h1 className="text-3xl font-bold mb-8">Mi cuenta</h1>

      <p className="mb-6 text-neutral-400">{user?.email}</p>

      <h2 className="text-xl font-semibold mb-4">Mis pedidos</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : orders.length === 0 ? (
        <p>No tienes pedidos aún</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-neutral-900 p-4 rounded-xl">
              <p className="font-bold">#{order.id.slice(0, 6)}</p>

              <p className="text-sm text-neutral-400">{order.status}</p>

              <p className="mt-2">€{(order.totalAmount / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
