"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { downloadInvoice } from "@/lib/api";

type Order = any;

export default function PublicOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = typeof params?.id === "string" ? params.id : undefined;

  const email = searchParams.get("email");
  const paid = searchParams.get("paid");

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchOrder() {
      try {
        let url;

        // Si viene de Stripe
        if (paid === "true") {
          url = `${process.env.NEXT_PUBLIC_API_URL}/orders/public-paid/${id}`;
        } else {
          if (!email) return;
          url = `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}?email=${email}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          setOrder(null);
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

    fetchOrder();
  }, [id, email, paid]);

  if (!id) return <div className="p-10">Cargando...</div>;

  if (loading) return <div className="p-10">Cargando...</div>;

  if (!order) return <div className="p-10">Pedido no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 6)}</h1>

      {paid && (
        <div className="bg-green-100 text-green-800 p-4 rounded">
          ✅ Pago realizado correctamente
        </div>
      )}

      <p className="text-gray-400">Estado: {order.status}</p>

      {/* ITEMS */}
      <div className="space-y-3">
        {order.items.map((item: any) => (
          <div key={item.id} className="border rounded p-4">
            <p className="font-semibold">{item.product.name}</p>

            <p className="text-sm text-gray-500">
              {item.quantity} × €{(item.price / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold">
        Total: €{(order.totalAmount / 100).toFixed(2)}
      </h2>

      {/* PAY BUTTON */}
      {order.status === "PENDING" && (
        <Link
          href={`/orders/${order.id}/pay`}
          className="bg-black text-white px-6 py-3 rounded inline-block"
        >
          Pagar pedido
        </Link>
      )}

      {/* INVOICE */}
      {order.invoice && (
        <button
          onClick={() => downloadInvoice(order.id)}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Descargar factura
        </button>
      )}
    </div>
  );
}
