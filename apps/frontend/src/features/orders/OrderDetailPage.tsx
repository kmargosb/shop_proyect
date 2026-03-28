"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  invoice?: {
    id: string;
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState(false);

  /* =========================
     FETCH ORDER (REUTILIZABLE)
  ========================= */

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/me`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    if (!id) return;

    fetchOrder().finally(() => setLoading(false));
  }, [id]);

  /* =========================
     REFUND
  ========================= */

  const handleRefund = async () => {
    try {
      setProcessingRefund(true);
      setRefundError(null);

      const items = order!.items.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      }));

      const payload = {
        orderId: order!.id,
        items,
        reason: "CUSTOMER_RETURN",
      };

      const res = await fetch(`${API_URL}/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setRefundError(data.message || "Error en devolución");
        return;
      }

      setRefundSuccess(true);
      
      // 🔥 esperar a que backend actualice estado para refrescar
      const waitForUpdatedStatus = async () => {
        let attempts = 0;

        while (attempts < 5) {
          await new Promise((res) => setTimeout(res, 800));

          const res = await fetch(`${API_URL}/orders/${id}/me`, {
            credentials: "include",
          });

          const data = await res.json();

          if (
            data.status === "REFUNDED" ||
            data.status === "PARTIALLY_REFUNDED"
          ) {
            setOrder(data);
            return;
          }

          attempts++;
        }

        // fallback
        await fetchOrder();
      };

      await waitForUpdatedStatus();

      // 🔥 CERRAR MODAL AUTOMÁTICO
      setTimeout(() => {
        setShowRefundModal(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setRefundError("Error inesperado");
    } finally {
      setProcessingRefund(false);
    }
  };

  /* =========================
     UI STATES
  ========================= */

  if (loading) {
    return <div className="p-10 text-white">Cargando pedido...</div>;
  }

  if (!order) {
    return <div className="p-10 text-white">Pedido no encontrado</div>;
  }

  const statusColor =
    order.status === "PAID"
      ? "bg-green-600"
      : order.status === "PENDING"
        ? "bg-yellow-600"
        : order.status === "REFUNDED"
          ? "bg-blue-600"
          : order.status === "PARTIALLY_REFUNDED"
            ? "bg-purple-600"
            : "bg-gray-600";

  return (
    <div className="min-h-screen bg-black text-white p-10 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 6)}</h1>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>
          {order.status}
        </span>
      </div>

      {/* ITEMS */}
      <div className="space-y-4">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900 p-4 rounded-xl flex justify-between items-center border border-neutral-800"
          >
            <div>
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-gray-400">
                {item.quantity} × €{(item.price / 100).toFixed(2)}
              </p>
            </div>

            <p className="font-bold">
              €{((item.price * item.quantity) / 100).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between border-t border-neutral-800 pt-4">
        <span>Total</span>
        <span className="text-xl font-bold">
          €{(order.totalAmount / 100).toFixed(2)}
        </span>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        {/* FACTURA */}
        {order.invoice && (
          <a
            href={`${API_URL}/orders/public/${order.id}/invoice`}
            className="bg-white text-black px-4 py-2 rounded-lg font-medium"
          >
            Descargar factura
          </a>
        )}

        {/* REFUND BUTTON / STATUS */}
        {order.status !== "REFUNDED" &&
        order.status !== "PARTIALLY_REFUNDED" ? (
          <button
            onClick={() => {
              setRefundError(null);
              setRefundSuccess(false);
              setShowRefundModal(true);
            }}
            className="border border-red-500 text-red-400 px-4 py-2 rounded-lg"
          >
            Solicitar devolución
          </button>
        ) : (
          <span className="text-green-400 font-medium">
            Reembolso completado
          </span>
        )}
      </div>

      {/* MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-neutral-900 p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Confirmar devolución</h2>

            <p className="text-sm text-gray-400">
              Se procesará el reembolso completo del pedido.
            </p>

            {refundError && (
              <p className="text-red-400 text-sm">{refundError}</p>
            )}

            {refundSuccess && (
              <p className="text-green-400 text-sm">Reembolso completado</p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400"
              >
                Cancelar
              </button>

              <button
                onClick={handleRefund}
                disabled={processingRefund}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                {processingRefund ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
