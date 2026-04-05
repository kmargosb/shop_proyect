"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        /* =========================
           1. TRY AUTH USER
        ========================= */

        let res = await apiFetch(`/orders/${id}`);

        if (res && res.ok) {
          const data = await res.json();
          setOrder(data);
          return;
        }

        /* =========================
           2. FALLBACK → GUEST
        ========================= */

        const email =
          searchParams.get("email") || localStorage.getItem("orderEmail");

        if (!email) return;

        res = await apiFetch(`/orders/public/${id}?email=${email}`);

        if (res && res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, searchParams]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No se pudo cargar el pedido
      </div>
    );
  }

  const isPaid = order.status === "PAID";

  const handleDownloadInvoice = () => {
    const email =
      searchParams.get("email") || localStorage.getItem("orderEmail");

    if (!email) {
      alert("No se encontró el email del pedido");
      return;
    }

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}/invoice?email=${email}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">
            {isPaid ? "Pago completado 🎉" : "Pedido creado"}
          </h1>

          <p className="text-neutral-400 text-sm">
            Pedido #{order.id.slice(0, 8)}
          </p>
        </div>

        {/* STATUS */}
        <div className="flex justify-center">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isPaid
                ? "bg-green-600/20 text-green-400"
                : "bg-yellow-600/20 text-yellow-400"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* ITEMS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Resumen del pedido</h2>

          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-neutral-300">
                {item.product?.name || item.productName} × {item.quantity}
              </span>

              <span>€{((item.price * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-neutral-700 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>€{(order.totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* DESCARGAR FACTURA */}
          {isPaid && (
            <Button className="w-full" onClick={handleDownloadInvoice}>
              Descargar factura
            </Button>
          )}

          {/* SEGUIR COMPRANDO */}
          <Button
            className="w-full bg-white text-black hover:bg-gray-200"
            onClick={() => router.push("/shop")}
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  );
}
