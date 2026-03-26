"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { downloadInvoice } from "@/shared/lib/api";

type Order = any;

export default function PublicOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = typeof params?.id === "string" ? params.id : undefined;

  const queryEmail = searchParams.get("email");

  const [email, setEmail] = useState<string | null>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     RESOLVE EMAIL
  ========================= */

  useEffect(() => {
    if (queryEmail) {
      localStorage.setItem("orderEmail", queryEmail);
      setEmail(queryEmail);
      return;
    }

    const storedEmail = localStorage.getItem("orderEmail");

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [queryEmail]);

  /* =========================
     FETCH ORDER
  ========================= */

  useEffect(() => {
    if (!id || !email) return;

    async function fetchOrder() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}?email=${email}`;

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
  }, [id, email]);

  if (!id) return <div className="p-10">Cargando...</div>;

  if (loading) return <div className="p-10">Cargando...</div>;

  if (!order) return <div className="p-10">Pedido no encontrado</div>;

  return (
  <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
    <div className="max-w-2xl w-full space-y-8">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Pedido
        </h1>

        <p className="text-neutral-500 text-sm">
          #{order.id.slice(0, 8)}
        </p>
      </div>

      {/* STATUS */}
      <div className="text-center">
        {order.status === "PAID" ? (
          <div className="space-y-2">
            <div className="text-4xl">✅</div>
            <p className="text-green-400 font-medium">
              Pago completado
            </p>
          </div>
        ) : (
          <p className="text-yellow-400">
            Pendiente de pago
          </p>
        )}
      </div>

      {/* CARD */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4 backdrop-blur-xl">
        
        {/* ITEMS */}
        {order.items.map((item: any) => (
          <div
            key={item.id}
            className="flex justify-between text-sm"
          >
            <span className="text-neutral-300">
              {item.product.name} × {item.quantity}
            </span>

            <span className="text-neutral-400">
              €{(item.price / 100).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="border-t border-white/[0.08] pt-4 flex justify-between font-medium">
          <span>Total</span>
          <span>€{(order.totalAmount / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-4">
        
        {/* PAY BUTTON */}
        {order.status !== "PAID" && (
          <Link
            href={`/orders/${order.id}/pay`}
            className="bg-white text-black py-3 rounded-xl text-center font-medium hover:opacity-90 transition"
          >
            Pagar pedido
          </Link>
        )}

        {/* INVOICE */}
        {order.invoice && (
          <button
            onClick={() => downloadInvoice(order.id)}
            className="border border-white/[0.1] py-3 rounded-xl text-sm hover:bg-white/[0.05] transition"
          >
            Descargar factura
          </button>
        )}

        {/* BACK TO SHOP */}
        <Link
          href="/shop"
          className="text-center text-sm text-neutral-500 hover:text-white transition"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  </div>
);
}