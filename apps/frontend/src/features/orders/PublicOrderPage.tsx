"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { downloadInvoice } from "@/lib/api";

type Order = any;

export default function PublicOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const email = searchParams.get("email");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}?email=${email}`
        );

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id && email) {
      fetchOrder();
    }
  }, [id, email]);

  if (loading)
    return (
      <div className="p-10 text-center">
        Cargando pedido...
      </div>
    );

  if (!order)
    return (
      <div className="p-10 text-center">
        Pedido no encontrado
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">
        Pedido #{order.id.slice(0, 6)}
      </h1>

      <p className="text-gray-400">
        Estado: {order.status}
      </p>

      {/* ITEMS */}
      <div className="space-y-3">
        {order.items.map((item: any) => (
          <div
            key={item.id}
            className="border border-gray-700 rounded p-4"
          >
            <p className="font-semibold">
              {item.product.name}
            </p>

            <p className="text-sm text-gray-400">
              {item.quantity} × ${item.price}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold">
        Total: ${order.total}
      </h2>

      {/* INVOICE */}
      {order.invoice && (
        <button
          onClick={() => downloadInvoice(order.id)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Descargar factura
        </button>
      )}
    </div>
  );
}