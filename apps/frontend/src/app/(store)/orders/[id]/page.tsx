"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

import { apiFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";

type OrderEvent = {
  id: string;
  type: string;
  message?: string;
  createdAt: string;
};

export default function Page() {
  const params = useParams();

  const searchParams = useSearchParams();

  const router = useRouter();

  const id = params?.id as string;

  const [order, setOrder] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        /* =========================
           AUTH USER
        ========================= */

        let res = await apiFetch(
          `/orders/${id}`,
        );

        if (res && res.ok) {
          const data =
            await res.json();

          setOrder(data);

          return;
        }

        /* =========================
           GUEST FALLBACK
        ========================= */

        const email =
          searchParams.get("email") ||
          localStorage.getItem(
            "orderEmail",
          );

        if (!email) return;

        res = await apiFetch(
          `/orders/public/${id}?email=${email}`,
        );

        if (res && res.ok) {
          const data =
            await res.json();

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
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        No se pudo cargar el pedido
      </div>
    );
  }

  const isPaid =
    order.status === "PAID";

  const canContinuePayment =
    order.status === "PENDING" ||
    order.status ===
      "PAYMENT_PROCESSING";

  const handleDownloadInvoice =
    () => {
      const email =
        searchParams.get("email") ||
        localStorage.getItem(
          "orderEmail",
        );

      if (!email) {
        alert(
          "No se encontró el email del pedido",
        );

        return;
      }

      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}/invoice?email=${email}`,
        "_blank",
      );
    };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* HERO */}

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-neutral-900 to-black p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-neutral-400">
                Pedido
              </div>

              <h1 className="text-4xl font-semibold tracking-tight">
                {isPaid
                  ? "Pago completado"
                  : "Pedido creado"}
              </h1>

              <p className="mt-3 text-neutral-400">
                Pedido #
                {order.id.slice(0, 8)}
              </p>
            </div>

            <div>
              <span
                className={`inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium ${
                  isPaid
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* ITEMS */}

        <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Resumen del pedido
            </h2>

            <span className="text-sm text-neutral-500">
              {order.items.length}{" "}
              productos
            </span>
          </div>

          <div className="space-y-4">
            {order.items.map(
              (item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.product?.name ||
                        item.productName}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      Cantidad:{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      €
                      {(
                        (item.price *
                          item.quantity) /
                        100
                      ).toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      €
                      {(
                        item.price / 100
                      ).toFixed(2)}{" "}
                      c/u
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-lg text-neutral-400">
              Total
            </span>

            <span className="text-3xl font-semibold">
              €
              {(
                order.totalAmount / 100
              ).toFixed(2)}
            </span>
          </div>
        </div>

        {/* TIMELINE */}

        {order.events?.length > 0 && (
          <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold">
                Estado del pedido
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Seguimiento en tiempo
                real del pedido
              </p>
            </div>

            <div className="space-y-8">
              {order.events.map(
                (
                  event: OrderEvent,
                  index: number,
                ) => {
                  const config =
                    getTimelineConfig(
                      event.type,
                    );

                  return (
                    <div
                      key={event.id}
                      className="relative flex gap-5"
                    >
                      {/* LINE */}

                      {index !==
                        order.events
                          .length -
                          1 && (
                        <div className="absolute left-[18px] top-10 h-full w-px bg-white/10" />
                      )}

                      {/* ICON */}

                      <div
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${config.className}`}
                      >
                        <config.icon
                          size={16}
                        />
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 pb-2">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <p className="font-medium">
                            {
                              config.label
                            }
                          </p>

                          <p className="text-xs text-neutral-500">
                            {new Date(
                              event.createdAt,
                            ).toLocaleString()}
                          </p>
                        </div>

                        {event.message && (
                          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                            {
                              event.message
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex flex-col gap-4 md:flex-row">
          {isPaid && (
            <Button
              className="h-12 w-full rounded-2xl"
              onClick={
                handleDownloadInvoice
              }
            >
              Descargar factura
            </Button>
          )}

          {canContinuePayment && (
            <Button
              className="h-12 w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400"
              onClick={async () => {
                try {
                  const res =
                    await apiFetch(
                      `/api/payments/retry/${order.id}`,
                      {
                        method:
                          "POST",
                      },
                    );

                  if (
                    !res ||
                    !res.ok
                  ) {
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
            >
              Continuar pago
            </Button>
          )}

          <Button
            className="h-12 w-full rounded-2xl bg-white text-black hover:bg-neutral-200"
            onClick={() =>
              router.push("/shop")
            }
          >
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  );
}

function getTimelineConfig(
  type: string,
) {
  switch (type) {
    case "ORDER_CREATED":
      return {
        label: "Pedido creado",
        icon: Package,
        className:
          "border-blue-500/20 bg-blue-500/10 text-blue-400",
      };

    case "PAYMENT_SUCCEEDED":
      return {
        label: "Pago confirmado",
        icon: CheckCircle2,
        className:
          "border-green-500/20 bg-green-500/10 text-green-400",
      };

    case "PAYMENT_FAILED":
      return {
        label: "Pago fallido",
        icon: XCircle,
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
      };

    case "PAYMENT_PROCESSING":
      return {
        label:
          "Pago en procesamiento",
        icon: CreditCard,
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
      };

    case "ORDER_SHIPPED":
      return {
        label: "Pedido enviado",
        icon: Truck,
        className:
          "border-purple-500/20 bg-purple-500/10 text-purple-400",
      };

    case "REFUND_CREATED":
      return {
        label:
          "Reembolso iniciado",
        icon: RefreshCcw,
        className:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
      };

    case "REFUND_COMPLETED":
      return {
        label:
          "Reembolso completado",
        icon: RefreshCcw,
        className:
          "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
      };

    case "ORDER_CANCELLED":
      return {
        label:
          "Pedido cancelado",
        icon: XCircle,
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: "Actualización",
        icon: Clock3,
        className:
          "border-white/10 bg-white/5 text-white",
      };
  }
}