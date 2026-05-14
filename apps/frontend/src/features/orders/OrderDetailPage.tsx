"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { apiFetch } from "@/shared/lib/api";

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

type RefundResponse = {
  message?: string;
  error?: string;
};

export default function OrderDetailPage() {
  const params = useParams();

  const router = useRouter();

  const id =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] = useState(true);

  const [showRefundModal, setShowRefundModal] =
    useState(false);

  const [processingRefund, setProcessingRefund] =
    useState(false);

  const [refundError, setRefundError] = useState<
    string | null
  >(null);

  const [refundSuccess, setRefundSuccess] =
    useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    try {
      const res = await apiFetch(`/orders/${id}/me`);

      if (!res || !res.ok) return;

      const data = (await res.json()) as Order;

      setOrder(data);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder().finally(() =>
      setLoading(false),
    );
  }, [fetchOrder]);

  const handleRefund = async () => {
    if (!order) return;

    try {
      setProcessingRefund(true);

      setRefundError(null);

      const payload = {
        orderId: order.id,

        items: order.items.map((item) => ({
          orderItemId: item.id,
          quantity: item.quantity,
        })),

        reason: "CUSTOMER_RETURN",
      };

      const res = await apiFetch("/refunds", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = res
        ? ((await res.json()) as RefundResponse)
        : null;

      if (!res || !res.ok) {
        setRefundError(
          data?.message ||
            data?.error ||
            "Error en devolución",
        );

        return;
      }

      setRefundSuccess(true);

      await waitForRefundStatus(
        id,
        setOrder,
        fetchOrder,
      );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-10">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black p-4 text-white sm:p-10">
        Pedido no encontrado
      </div>
    );
  }

  const statusColor = getStatusColor(order.status);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-neutral-950/80 p-4 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Detalle de pedido
            </p>

            <h1 className="mt-2 break-all text-2xl font-bold">
              Pedido #{order.id.slice(0, 6)}
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              {new Date(
                order.createdAt,
              ).toLocaleDateString()}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs ${statusColor}`}
          >
            {order.status}
          </span>
        </div>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold">
                  {item.product.name}
                </p>

                <p className="text-sm text-gray-400">
                  {item.quantity} × €
                  {(item.price / 100).toFixed(2)}
                </p>
              </div>

              <p className="shrink-0 font-bold">
                €
                {(
                  (item.price * item.quantity) /
                  100
                ).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
          <span>Total</span>

          <span className="text-xl font-bold">
            €
            {(order.totalAmount / 100).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {order.invoice && (
            <a
              href={`${API_URL}/orders/public/${order.id}/invoice`}
              className="inline-flex justify-center rounded-lg bg-white px-4 py-3 font-medium text-black sm:py-2"
            >
              Descargar factura
            </a>
          )}

          {(order.status === "PENDING" ||
            order.status === "PAYMENT_PROCESSING") && (
            <button
              onClick={async () => {
                try {
                  const res = await apiFetch(
                    `/payments/retry/${order.id}`,
                    {
                      method: "POST",
                    },
                  );

                  if (!res || !res.ok) {
                    throw new Error();
                  }

                  const data =
                    await res.json();

                  router.push(
                    `/orders/${order.id}/pay?clientSecret=${data.clientSecret}`,
                  );
                } catch {
                  alert(
                    "No se pudo continuar el pago",
                  );
                }
              }}
              className="rounded-lg border border-yellow-500 px-4 py-3 text-yellow-300"
            >
              Continuar pago
            </button>
          )}

          {order.status !== "REFUNDED" &&
            order.status !==
              "PARTIALLY_REFUNDED" && (
              <button
                onClick={() => {
                  setRefundError(null);

                  setRefundSuccess(false);

                  setShowRefundModal(true);
                }}
                className="rounded-lg border border-red-500 px-4 py-3 text-red-400 sm:py-2"
              >
                Solicitar devolución
              </button>
            )}

          {(order.status === "REFUNDED" ||
            order.status ===
              "PARTIALLY_REFUNDED") && (
            <span className="py-2 font-medium text-green-400">
              Reembolso completado
            </span>
          )}
        </div>
      </div>

      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl sm:p-6">
            <h2 className="text-lg font-semibold">
              Confirmar devolución
            </h2>

            <p className="mt-3 text-sm text-gray-400">
              Se procesará el reembolso
              completo del pedido.
            </p>

            {refundError && (
              <p className="mt-4 text-sm text-red-400">
                {refundError}
              </p>
            )}

            {refundSuccess && (
              <p className="mt-4 text-sm text-green-400">
                Reembolso completado
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setShowRefundModal(false)
                }
                className="rounded-lg px-4 py-3 text-gray-400 transition hover:bg-white/10 sm:py-2"
              >
                Cancelar
              </button>

              <button
                onClick={handleRefund}
                disabled={processingRefund}
                className="rounded-lg bg-red-500 px-4 py-3 font-medium disabled:opacity-60 sm:py-2"
              >
                {processingRefund
                  ? "Procesando..."
                  : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function waitForRefundStatus(
  id: string,
  setOrder: (order: Order) => void,
  fallback: () => Promise<void>,
) {
  for (
    let attempts = 0;
    attempts < 5;
    attempts += 1
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, 800),
    );

    const res = await apiFetch(
      `/orders/${id}/me`,
    );

    if (!res || !res.ok) continue;

    const data = (await res.json()) as Order;

    if (
      data.status === "REFUNDED" ||
      data.status ===
        "PARTIALLY_REFUNDED"
    ) {
      setOrder(data);

      return;
    }
  }

  await fallback();
}

function getStatusColor(status: string) {
  if (status === "PAID")
    return "bg-green-600";

  if (
    status === "PENDING" ||
    status === "PAYMENT_PROCESSING"
  ) {
    return "bg-yellow-600";
  }

  if (status === "REFUNDED")
    return "bg-blue-600";

  if (status === "PARTIALLY_REFUNDED") {
    return "bg-purple-600";
  }

  return "bg-gray-600";
}