"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ShipmentStatusCard from "@/features/orders/components/ShipmentStatusCard";
import { socket } from "@/shared/lib/socket";
import type {
  DashboardUpdatePayload,
  OrderUpdatedPayload,
} from "@/shared/lib/socket";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

import { apiFetch, publicFetch } from "@/shared/lib/api";
import { Button } from "@/shared/ui/button";

type OrderEvent = {
  id: string;
  type: string;
  message?: string;
  createdAt: string;
};

const cancellationReasons: Record<string, string> = {
  WRONG_PRODUCT: "Producto equivocado",
  WRONG_SIZE: "Talla Equivocada",
  WRONG_COLOR: "Color Equivocado",
  CHANGED_MIND: "Ya no lo quiero",
  ACCIDENTAL_ORDER: "Compra por error",
  OTHER: "Otro motivo",
};

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const timelineBottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundItems, setRefundItems] = useState<Record<string, number>>({});
  const [refundReason, setRefundReason] = useState("CUSTOMER_RETURN");
  const [refundComment, setRefundComment] = useState("");
  const [refundImages, setRefundImages] = useState<File[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("CUSTOMER_REQUEST");

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        const email =
          searchParams.get("email") || localStorage.getItem("orderEmail");

        /* GUEST */

        if (email) {
          const publicRes = await publicFetch(
            `/orders/public/${id}?email=${encodeURIComponent(email)}`,
          );

          const data = await publicRes.json();

          setOrder(data);

          return;
        }

        /* AUTH USER */

        const res = await apiFetch(`/orders/${id}`);

        if (res?.ok) {
          const data = await res.json();

          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    /* =========================
     INITIAL LOAD
  ========================= */

    void loadOrder();

    /* =========================
     REALTIME UPDATES
  ========================= */

    const refreshOrder = (
      payload?: DashboardUpdatePayload | OrderUpdatedPayload,
    ) => {
      if (!payload?.orderId || payload.orderId === id) {
        void loadOrder();
      }
    };

    // socket.on("dashboard:update", refreshOrder);
    socket.on("orderUpdated", refreshOrder);

    return () => {
      // socket.off("dashboard:update", refreshOrder);
      socket.off("orderUpdated", refreshOrder);
    };
  }, [id, searchParams]);

  useEffect(() => {
    timelineBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [order?.events]);

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

  const isPaid = order.status === "PAID";

  const canContinuePayment =
    order.status === "PENDING" || order.status === "PAYMENT_PROCESSING";

  const canCancel =
    order.status === "PENDING" ||
    order.status === "PAYMENT_PROCESSING" ||
    order.status === "PAID";

  const hasRefundableItems = order.items?.some((item: any) => {
    const refunded =
      item.refundItems?.reduce(
        (sum: number, ri: any) => sum + ri.quantity,
        0,
      ) || 0;

    return refunded < item.quantity;
  });

  const canRefund =
    (order.status === "DELIVERED" || order.status === "PARTIALLY_REFUNDED") &&
    hasRefundableItems;

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
  const handleCancelOrder = async () => {
    try {
      setCancelling(true);

      const res = await apiFetch(`/orders/${order.id}/cancel`, {
        method: "POST",

        body: JSON.stringify({
          reason: cancelReason,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      const refreshed = await apiFetch(`/orders/${order.id}`);

      if (!refreshed || !refreshed.ok) {
        throw new Error();
      }

      const updatedOrder = await refreshed.json();

      setOrder(updatedOrder);
    } catch (error) {
      console.error(error);

      alert("No se pudo cancelar el pedido");
    } finally {
      setCancelling(false);
    }
  };

  const handleRefund = async () => {
    try {
      setProcessingRefund(true);

      setRefundError(null);

      const items = order.items
        .filter((item: any) => (refundItems[item.id] || 0) > 0)
        .map((item: any) => ({
          orderItemId: item.id,
          quantity: refundItems[item.id],
        }));

      if (items.length === 0) {
        setRefundError("Selecciona al menos un producto");

        return;
      }

      const res = await apiFetch("/refunds", {
        method: "POST",
        body: JSON.stringify({
          orderId: order.id,
          items,
          reason: refundReason,
          note: refundComment,
        }),
      });

      const data = await res?.json();

      if (!res || !res.ok) {
        setRefundError(data?.message || "No se pudo procesar");

        return;
      }

      const refreshed = await apiFetch(`/orders/${order.id}`);

      if (refreshed && refreshed.ok) {
        const updatedOrder = await refreshed.json();

        setOrder(updatedOrder);
      }

      setRefundSuccess(true);

      setTimeout(() => {
        setShowRefundModal(false);

        setRefundSuccess(false);

        setRefundItems({});
      }, 1200);
    } catch (error) {
      console.error(error);

      setRefundError("Error inesperado");
    } finally {
      setProcessingRefund(false);
    }
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
                {isPaid ? "Pago completado" : "Pedido creado"}
              </h1>

              <p className="mt-3 text-neutral-400">
                Pedido #{order.id.slice(0, 8)}
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

        {/* ORDER PROGRESS */}

        {(() => {
          const steps = [
            {
              key: "PENDING",
              label: "Pedido",
            },
            {
              key: "PAID",
              label: "Pagado",
            },
            {
              key: "SHIPPED",
              label: "Enviado",
            },
            {
              key: "DELIVERED",
              label: "Entregado",
            },
          ];

          const currentStep = (() => {
            switch (order.status) {
              case "PENDING":
              case "PAYMENT_PROCESSING":
                return 0;

              case "PAID":
              case "PARTIALLY_REFUNDED":
              case "REFUNDED":
                return 1;

              case "SHIPPED":
                return 2;

              case "DELIVERED":
                return 3;

              default:
                return 0;
            }
          })();

          return (
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold">Estado del pedido</h2>

                <div className="mt-2 space-y-1">
                  <p className="text-sm text-neutral-500">
                    Seguimiento del progreso de tu pedido
                  </p>

                  {order.shipment && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                        {order.shipment.carrier}
                      </span>

                      {order.shipment.trackingNumber && (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                          Tracking: {order.shipment.trackingNumber}
                        </span>
                      )}

                      {order.shipment.shippedAt && (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
                          Enviado:{" "}
                          {new Date(order.shipment.shippedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {steps.map((step, index) => {
                  const active = index <= currentStep;

                  const lineActive = index < currentStep;

                  return (
                    <div
                      key={step.key}
                      className="relative flex flex-1 justify-center"
                    >
                      <div className="flex flex-col items-center">
                        {/* DOT */}

                        <div
                          className={`
                    relative z-10
                    flex h-8 w-8 items-center justify-center
                    rounded-full border text-xs font-semibold
                    transition-all duration-500

                    ${
                      active
                        ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        : "border-white/10 bg-white/[0.03] text-neutral-500"
                    }
                  `}
                        >
                          {index + 1}
                        </div>

                        {/* LABEL */}

                        <p
                          className={`
                                      mt-2 text-[10px] font-medium uppercase text-center leading-tight
                                      ${active ? "text-white" : "text-neutral-500"}
                          `}
                        >
                          {step.label}
                        </p>
                      </div>

                      {/* LINE */}

                      {index !== steps.length - 1 && (
                        <div className="absolute left-1/2 top-4 ml-6 h-px w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`
                      absolute left-0 top-0 h-full
                      transition-all duration-700

                      ${lineActive ? "w-full bg-white" : "w-0 bg-white"}
                    `}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ITEMS */}

        <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Artículos del pedido</h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Productos comprados y estado de devolución
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-neutral-400">
                {(() => {
                  const totalProducts = order.items.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0,
                  );

                  return `${totalProducts} ${
                    totalProducts === 1 ? "producto" : "productos"
                  }`;
                })()}
              </span>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                Entrega en
              </p>

              <p className="text-sm text-neutral-400">{order.addressLine1}</p>

              <p className="text-sm text-neutral-400">
                {order.postalCode} {order.city}, {order.country}
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {order.fullName} {order.phone}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item: any) => {
              const refundedQuantity =
                item.refundItems?.reduce(
                  (sum: number, ri: any) => sum + ri.quantity,
                  0,
                ) || 0;

              const remainingQuantity = item.quantity - refundedQuantity;

              const isFullyRefunded = remainingQuantity <= 0;

              const isPartiallyRefunded =
                refundedQuantity > 0 && remainingQuantity > 0;

              const image =
                item.product?.images?.find((img: any) => img.isPrimary)?.url ??
                item.product?.images?.[0]?.url ??
                item.product?.image ??
                null;

              return (
                <div
                  key={item.id}
                  className="
            group
            overflow-hidden
            rounded-3xl
            border border-white/5
            bg-gradient-to-b
            from-white/[0.03]
            to-white/[0.015]
            p-5
            transition-all duration-300

            hover:border-white/10
            hover:bg-white/[0.04]
            hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]
          "
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    {/* LEFT */}

                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {/* IMAGE */}

                      <div
                        className="
                  relative
                  flex h-24 w-24 shrink-0
                  items-center justify-center
                  overflow-hidden
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                "
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={item.product?.name || item.productName}
                            className="
                      h-full w-full object-cover
                      transition duration-500
                      group-hover:scale-105
                    "
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-sm font-semibold text-neutral-500">
                            {(item.product?.name || item.productName)
                              ?.slice(0, 2)
                              ?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold">
                          {item.product?.name || item.productName}
                        </p>

                        {(item.color || item.size) && (
                          <p className="mt-1 text-sm text-neutral-400">
                            {item.color}
                            {item.color && item.size ? " · " : ""}
                            {item.size}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-neutral-500">
                          Cantidad: {item.quantity}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-600">
                          Premium product
                        </p>
                      </div>
                    </div>

                    {/* CENTER */}

                    <div className="flex flex-wrap items-center gap-2 md:min-w-[260px] md:justify-center">
                      {/* {isFullyRefunded && (
                        <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                          Refund completed
                        </span>
                      )}

                      {isPartiallyRefunded && (
                        <span className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
                          Partially refunded
                        </span>
                      )}

                      {refundedQuantity > 0 && (
                        <>
                          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                            Refunded: {refundedQuantity}
                          </span>

                          <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-neutral-400">
                            Remaining: {remainingQuantity}
                          </span>
                        </>
                      )} */}
                    </div>

                    {/* RIGHT */}

                    <div className="text-left md:min-w-[140px] md:text-right">
                      <p className="text-3xl font-semibold tracking-tight">
                        €{((item.price * item.quantity) / 100).toFixed(2)}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {item.quantity} × €{(item.price / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-lg text-neutral-400">Total</span>

            <span className="text-4xl font-semibold tracking-tight">
              €{(order.totalAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* TIMELINE */}

        {order.events?.length > 0 && (
          <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold">Estado del pedido</h2>

              <p className="mt-2 text-sm text-neutral-500">
                Seguimiento en tiempo real del pedido
              </p>
            </div>

            <div className="relative max-h-[420px] space-y-3 overflow-y-auto premium-scrollbar pr-1">
              {order.events.map((event: OrderEvent, index: number) => {
                const config = getTimelineConfig(event.type);

                return (
                  <div
                    key={event.id}
                    className="relative flex gap-3 rounded-xl border border-white/[0.03] bg-white/[0.015] px-3 py-2.5"
                  >
                    {/* CONNECTOR */}

                    {index !== order.events.length - 1 && (
                      <div className="absolute left-[13px] top-8 h-6 w-px bg-gradient-to-b from-white/20 to-transparent" />
                    )}

                    {/* ICON */}

                    <div
                      className={`relative z-10 flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full border ${config.className}`}
                    >
                      <config.icon size={13} />
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs font-semibold">{config.label}</p>

                        <p className="text-[10px] text-neutral-600">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {event.message && (
                        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                          {event.message
                            .replace(
                              "WRONG_PRODUCT",
                              cancellationReasons.WRONG_PRODUCT,
                            )
                            .replace(
                              "WRONG_SIZE",
                              cancellationReasons.WRONG_SIZE,
                            )
                            .replace(
                              "WRONG_COLOR",
                              cancellationReasons.WRONG_COLOR,
                            )
                            .replace(
                              "CHANGED_MIND",
                              cancellationReasons.CHANGED_MIND,
                            )
                            .replace(
                              "ACCIDENTAL_ORDER",
                              cancellationReasons.ACCIDENTAL_ORDER,
                            )
                            .replace("OTHER", cancellationReasons.OTHER)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="pointer-events-none absolute bottom-0 left-0  w-full bg-gradient-to-t from-neutral-950 " />
              <div ref={timelineBottomRef} />
            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex flex-col gap-4 md:flex-row">
          {isPaid && (
            <Button
              className="h-12 w-full rounded-2xl"
              onClick={handleDownloadInvoice}
            >
              Descargar factura
            </Button>
          )}

          {canContinuePayment && (
            <Button
              className="h-12 w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400"
              onClick={async () => {
                try {
                  const res = await apiFetch(
                    `/api/payments/retry/${order.id}`,
                    {
                      method: "POST",
                    },
                  );

                  if (!res || !res.ok) {
                    throw new Error();
                  }

                  const data = await res.json();

                  router.push(
                    `/orders/${order.id}/pay?clientSecret=${data.clientSecret}`,
                  );
                } catch {
                  alert("No se pudo continuar el pago");
                }
              }}
            >
              Continuar pago
            </Button>
          )}

          <Button
            className="h-12 w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300"
            onClick={() => router.push(`/orders/${order.id}/help`)}
          >
            ¿Necesitas ayuda con tu pedido?
          </Button>
          {canRefund && (
            <Button
              className="h-12 w-full rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
              onClick={() => {
                setRefundError(null);

                setRefundSuccess(false);

                setShowRefundModal(true);
              }}
            >
              Solicitar devolución
            </Button>
          )}

          <Button
            className="h-12 w-full rounded-2xl bg-white text-black hover:bg-neutral-200"
            onClick={() => router.push("/shop")}
          >
            Seguir comprando
          </Button>
        </div>

        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-2xl font-semibold">Solicitar devolución</h2>

              <div className="mt-6 space-y-4">
                {order.items
                  .filter((item: any) => {
                    const refunded =
                      item.refundItems?.reduce(
                        (sum: number, ri: any) => sum + ri.quantity,
                        0,
                      ) || 0;

                    return refunded < item.quantity;
                  })
                  .map((item: any) => {
                    const refunded =
                      item.refundItems?.reduce(
                        (sum: number, ri: any) => sum + ri.quantity,
                        0,
                      ) || 0;

                    const remaining = item.quantity - refunded;

                    const selected = refundItems[item.id] || 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {item.product?.name ?? item.productName}
                            </p>

                            {(item.color || item.size) && (
                              <p className="mt-1 text-sm text-neutral-400">
                                {item.color}
                                {item.color && item.size ? " · " : ""}
                                {item.size}
                              </p>
                            )}

                            <p className="mt-1 text-sm text-neutral-500">
                              Comprados: {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setRefundItems((prev) => ({
                                  ...prev,
                                  [item.id]: Math.max(0, selected - 1),
                                }))
                              }
                              className="h-8 w-8 rounded-full border border-white/10"
                            >
                              -
                            </button>

                            <span className="w-6 text-center">{selected}</span>

                            <button
                              onClick={() =>
                                setRefundItems((prev) => ({
                                  ...prev,
                                  [item.id]: Math.min(remaining, selected + 1),
                                }))
                              }
                              className="h-8 w-8 rounded-full border border-white/10"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm text-neutral-400">
                  Motivo de la devolución
                </label>

                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                >
                  <option value="CUSTOMER_RETURN">Ya no lo quiero</option>

                  <option value="WRONG_ITEM">Producto incorrecto</option>

                  <option value="DAMAGED">Producto dañado</option>

                  <option value="OTHER">Otro</option>
                </select>
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-neutral-400">
                    Comentario
                  </label>

                  <textarea
                    rows={4}
                    value={refundComment}
                    onChange={(e) => setRefundComment(e.target.value)}
                    placeholder="Cuéntanos qué ha ocurrido..."
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                  />
                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-neutral-400">
                      Fotos (opcional)
                    </label>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setRefundImages(Array.from(e.target.files || []))
                      }
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              {refundError && (
                <p className="mt-4 text-sm text-red-400">{refundError}</p>
              )}

              {refundSuccess && (
                <p className="mt-4 text-sm text-green-400">
                  Reembolso procesado
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  className="w-full bg-white text-black hover:bg-neutral-200"
                  onClick={() => setShowRefundModal(false)}
                >
                  Cancelar
                </Button>

                <Button
                  className="w-full"
                  onClick={handleRefund}
                  disabled={processingRefund}
                >
                  {processingRefund ? "Procesando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-2xl font-semibold">Cancelar pedido</h2>

              <p className="mt-3 text-sm text-neutral-400">
                Esta acción devolverá el dinero y restaurará el stock reservado.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm text-neutral-400">
                  Motivo
                </label>

                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                >
                  <option value="WRONG_PRODUCT">
                    Me equivoqué de producto
                  </option>
                  <option value="WRONG_SIZE">Me equivoqué de talla</option>
                  <option value="WRONG_COLOR">Me equivoqué de color</option>
                  <option value="CHANGED_MIND">Ya no lo quiero</option>
                  <option value="ACCIDENTAL_ORDER">Compra por error</option>
                  <option value="Wrong shipping address">
                    Direccion incorrecta
                  </option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3 text-black">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCancelModal(false)}
                >
                  Volver
                </Button>

                <Button
                  className="w-full border border-red-500/20 bg-red-500/10 text-red-300"
                  disabled={cancelling}
                  onClick={async () => {
                    setShowCancelModal(false);

                    await handleCancelOrder();
                  }}
                >
                  {cancelling ? "Cancelando..." : "Confirmar cancelación"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimelineConfig(type: string) {
  switch (type) {
    case "ORDER_CREATED":
      return {
        label: "Pedido creado",
        icon: Package,
        className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      };

    case "PAYMENT_SUCCEEDED":
      return {
        label: "Pago confirmado",
        icon: CheckCircle2,
        className: "border-green-500/20 bg-green-500/10 text-green-400",
      };

    case "PAYMENT_FAILED":
      return {
        label: "Pago fallido",
        icon: XCircle,
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    case "PAYMENT_PROCESSING":
      return {
        label: "Pago en procesamiento",
        icon: CreditCard,
        className: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
      };

    case "ORDER_SHIPPED":
      return {
        label: "Pedido enviado",
        icon: Truck,
        className: "border-purple-500/20 bg-purple-500/10 text-purple-400",
      };

    case "ORDER_DELIVERED":
      return {
        label: "Pedido entregado",
        icon: CheckCircle2,
        className: "border-green-500/20 bg-green-500/10 text-green-400",
      };

    case "REFUND_CREATED":
      return {
        label: "Reembolso iniciado",
        icon: RefreshCcw,
        className: "border-orange-500/20 bg-orange-500/10 text-orange-400",
      };

    case "REFUND_COMPLETED":
      return {
        label: "Reembolso completado",
        icon: RefreshCcw,
        className: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
      };

    case "ORDER_CANCELLED":
      return {
        label: "Pedido cancelado",
        icon: XCircle,
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: "Actualización",
        icon: Clock3,
        className: "border-white/10 bg-white/5 text-white",
      };
  }
}
