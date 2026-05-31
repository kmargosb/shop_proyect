"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/shared/lib/api";
import {
  statusLabels,
  colorLabels,
  countryLabels,
  timelineLabels,
  refundReasonLabels,
  refundStatusLabels,
  statusStyles,
  refundStatusStyles,
} from "@/shared/constants/orderLabels";

export default function DashboardOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      const res = await apiFetch(`/orders/admin/${id}`);
      if (!res) return;
      const data = await res.json();
      setOrder(data);
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (!order) {
    return <div className="p-6 text-white">Cargando pedido...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_420px]">
        {/* LEFT COLUMN */}

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  PEDIDO #{order.id.slice(0, 8).toUpperCase()}
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleString("es-ES")}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-neutral-500">Estado</p>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                    statusStyles[order.status] ?? ""
                  }`}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-neutral-500">Cliente</p>

                <p className="mt-1 text-white">{order.fullName}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-500">Email</p>

                <p className="mt-1 text-white break-all">{order.email}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-500">Teléfono</p>

                <p className="mt-1 text-white">{order.phone}</p>
              </div>

              <div>
                <p className="text-xs uppercase text-neutral-500">Total</p>

                <p className="mt-1 text-white">
                  €{(order.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* PRODUCTS PLACEHOLDER */}

          <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold text-white">Productos</h2>

            <div className="mt-6 space-y-4">
              {order.items.map((item: any) => {
                const image =
                  item.product?.images?.find((img: any) => img.isPrimary)
                    ?.url ??
                  item.product?.images?.[0]?.url ??
                  null;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-white/10 p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                      {image ? (
                        <img
                          src={image}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {item.productName}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.size && (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                            Talla {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                            {colorLabels[item.color] ?? item.color}
                          </span>
                        )}

                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                          Cantidad {item.quantity}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-neutral-400">
                          ID producto: {item.productId.slice(0, 8)}
                        </p>

                        <p className="font-semibold text-white">
                          €{(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TIMELINE PLACEHOLDER */}

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
          <h2 className="text-lg font-semibold text-white">Timeline</h2>

          <div className="mt-6 space-y-5">
            {order.events.map((event: any, index: number) => (
              <div key={event.id} className="relative pl-6">
                {index !== order.events.length - 1 && (
                  <div className="absolute left-[7px] top-6 h-full w-px bg-white/10" />
                )}

                <div className="absolute left-0 top-1 h-4 w-4 rounded-full border border-white/20 bg-emerald-400" />

                <div>
                  <p className="text-sm font-medium text-white">
                    {timelineLabels[event.type] ?? event.message}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(event.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
          <h2 className="text-lg font-semibold text-white">Devoluciones</h2>

          {!order.refunds?.length ? (
            <p className="mt-4 text-sm text-neutral-500">
              No hay devoluciones para este pedido.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {order.refunds.map((refund: any) => (
                <div
                  key={refund.id}
                  className="rounded-2xl border border-white/10 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">Estado</p>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                          refundStatusStyles[refund.status] ?? ""
                        }`}
                      >
                        {refundStatusLabels[refund.status] ?? refund.status}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-neutral-500">Importe</p>

                      <p className="font-semibold text-white">
                        €{(refund.amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-neutral-500">Motivo</p>

                    <p className="mt-1 text-white">
                      {refundReasonLabels[refund.reason] ?? refund.reason}
                    </p>
                  </div>

                  {refund.note && (
                    <div className="mt-4">
                      <p className="text-sm text-neutral-500">
                        Comentario cliente
                      </p>

                      <p className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-neutral-300">
                        {refund.note}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-neutral-500">
                    Solicitud creada el{" "}
                    {new Date(refund.createdAt).toLocaleString("es-ES")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold text-white">
              Dirección de envío
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium text-white">{order.fullName}</p>

              <p className="text-neutral-400">{order.addressLine1}</p>

              {order.addressLine2 && (
                <p className="text-neutral-400">{order.addressLine2}</p>
              )}

              <p className="text-neutral-400">
                {order.postalCode} {order.city}
              </p>

              <p className="text-neutral-400">
                {countryLabels[order.country] ?? order.country}
              </p>

              <div className="border-t border-white/10 pt-4">
                <p className="text-neutral-400 break-all">{order.email}</p>

                <p className="text-neutral-400">{order.phone}</p>
              </div>
            </div>
          </div>

          {/* SHIPPING PLACEHOLDER */}

          <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h2 className="text-lg font-semibold text-white">Envío</h2>

            {!order.shipment ? (
              <p className="mt-4 text-sm text-neutral-500">
                No se ha creado ningún envío todavía.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase text-neutral-500">
                    Transportista
                  </p>

                  <p className="mt-1 text-white">{order.shipment.carrier}</p>
                </div>

                <div>
                  <p className="text-xs uppercase text-neutral-500">Tracking</p>

                  <p className="mt-1 break-all text-white">
                    {order.shipment.trackingNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-neutral-500">Estado</p>

                  <p className="mt-1 font-medium text-white">
                    {order.shipment.status}
                  </p>
                </div>

                {order.shipment.shippedAt && (
                  <div>
                    <p className="text-xs uppercase text-neutral-500">
                      Enviado
                    </p>

                    <p className="mt-1 text-white">
                      {new Date(order.shipment.shippedAt).toLocaleString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                )}

                {order.shipment.deliveredAt && (
                  <div>
                    <p className="text-xs uppercase text-neutral-500">
                      Entregado
                    </p>

                    <p className="mt-1 text-white">
                      {new Date(order.shipment.deliveredAt).toLocaleString(
                        "es-ES",
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
