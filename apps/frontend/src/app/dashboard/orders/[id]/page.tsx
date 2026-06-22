'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/shared/lib/api';
import {
  statusLabels,
  colorLabels,
  countryLabels,
  timelineLabels,
  refundReasonLabels,
  refundStatusLabels,
  statusStyles,
  refundStatusStyles,
  shipmentStatusLabels,
} from '@/shared/constants/orderLabels';
import ShipmentModal from '@/features/orders/components/ShipmentModal';
import EditOrderModal from '@/features/orders/components/EditOrderModal';
import { socket } from '@/shared/lib/socket';
import type { DashboardUpdatePayload, OrderUpdatedPayload } from '@/shared/lib/socket';

const CUSTOMER_MESSAGE_PREFIX = 'Cliente · ';
const ADMIN_REPLY_PREFIX = 'Soporte · ';
const INTERNAL_NOTE_PREFIX = 'Interno · ';

export default function DashboardOrderPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const timelineBottomRef = useRef<HTMLDivElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRefundId, setRejectRefundId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [includeCancelLink, setIncludeCancelLink] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    const res = await apiFetch(`/orders/admin/${id}`);

    if (!res) return;
    const data = await res.json();

    setOrder(data);
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadOrder();
    }
  }, [id, loadOrder]);

  useEffect(() => {
    if (!id) return;

    const refreshOrder = (payload?: DashboardUpdatePayload | OrderUpdatedPayload) => {
      if (!payload?.orderId || payload.orderId === id) {
        void loadOrder();
      }
    };

    socket.on('dashboard:update', refreshOrder);
    socket.on('orderUpdated', refreshOrder);

    return () => {
      socket.off('dashboard:update', refreshOrder);
      socket.off('orderUpdated', refreshOrder);
    };
  }, [id, loadOrder]);

  useEffect(() => {
    timelineBottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [order?.events]);

  const markDelivered = async () => {
    try {
      const shipmentId = order?.shipment?.id;

      if (!shipmentId) return;

      const confirmed = window.confirm('¿Marcar este envío como entregado?');

      if (!confirmed) return;

      await apiFetch(`/shipping/${shipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DELIVERED',
        }),
      });

      await loadOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const approveRefund = async (refundId: string) => {
    try {
      await apiFetch(`/refunds/${refundId}/approve`, {
        method: 'POST',
      });

      await loadOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRefund = (refundId: string) => {
    setRejectRefundId(refundId);

    setRejectReason('');

    setRejectOpen(true);
  };

  const receivedRefund = async (refundId: string) => {
    try {
      await apiFetch(`/refunds/${refundId}/received`, {
        method: 'POST',
      });

      await loadOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const processRefund = async (refundId: string) => {
    try {
      await apiFetch(`/refunds/${refundId}/process`, {
        method: 'POST',
      });

      await loadOrder();
    } catch (error) {
      console.error(error);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      setSendingReply(true);

      const res = await apiFetch(`/orders/${order.id}/reply`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          message: replyMessage,
          includeCancelLink,
        }),
      });

      if (!res || !res.ok) {
        throw new Error();
      }

      setReplyOpen(false);
      setReplyMessage('');
      setIncludeCancelLink(false);

      await loadOrder();
    } catch (error) {
      console.error(error);
      alert('No se pudo enviar la respuesta');
    } finally {
      setSendingReply(false);
    }
  };

  const confirmRejectRefund = async () => {
    if (rejectReason.trim().length < 10) {
      alert('Describe el motivo con al menos 10 caracteres');
      return;
    }

    try {
      await apiFetch(`/refunds/${rejectRefundId}/reject`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          rejectionReason: rejectReason,
        }),
      });

      setRejectOpen(false);
      setRejectRefundId(null);
      setRejectReason('');

      await loadOrder();
    } catch (error) {
      console.error(error);
    }
  };

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
    });
  }

  if (!order) {
    return <div className="p-6 text-white">Cargando pedido...</div>;
  }

  return (
    <>
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

                  <p className="mt-2 text-sm text-neutral-500">{formatDateTime(order.createdAt)}</p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-neutral-500">Estado</p>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                      statusStyles[order.status] ?? ''
                    }`}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase">Cliente</p>

                  <p className="mt-1 text-white">{order.fullName}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 uppercase">Email</p>

                  <p className="mt-1 break-all text-white">{order.email}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 uppercase">Teléfono</p>

                  <p className="mt-1 text-white">{order.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 uppercase">Total</p>

                  <p className="mt-1 text-white">€{(order.totalAmount / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* PRODUCTS PLACEHOLDER */}

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-lg font-semibold text-white">Productos</h2>

              <div className="mt-6 space-y-4">
                {order.items.map((item: any) => {
                  const image =
                    item.product?.images?.find((img: any) => img.isPrimary)?.url ??
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
                        <h3 className="truncate font-semibold text-white">{item.productName}</h3>

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

            {/* TIMELINE PLACEHOLDER */}

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-lg font-semibold text-white">Timeline</h2>

              <div className="premium-scrollbar mt-6 max-h-[400px] space-y-5 overflow-y-auto pr-2">
                {order.events.map((event: any, index: number) => {
                  const isCustomerMessage =
                    typeof event.message === 'string' &&
                    (event.message.startsWith('CUSTOMER_MESSAGE') ||
                      event.message.startsWith(CUSTOMER_MESSAGE_PREFIX));

                  const isAdminReply =
                    typeof event.message === 'string' &&
                    (event.message.startsWith('ADMIN_REPLY:') ||
                      event.message.startsWith(ADMIN_REPLY_PREFIX));

                  return (
                    <div key={event.id} className="relative pl-6">
                      {index !== order.events.length - 1 && (
                        <div className="absolute top-6 left-[7px] h-full w-px bg-white/10" />
                      )}

                      <div
                        className={`absolute top-1 left-0 h-4 w-4 rounded-full border ${
                          isCustomerMessage
                            ? 'border-sky-400 bg-sky-400'
                            : 'border-white/20 bg-emerald-400'
                        }`}
                      />
                      {isCustomerMessage ? (
                        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                          <p className="font-semibold text-sky-300">Cliente</p>

                          <button
                            onClick={() => setReplyOpen(true)}
                            className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-300"
                          >
                            Responder
                          </button>

                          <p className="mt-3 text-sm text-neutral-200">
                            {event.message
                              .replace('CUSTOMER_MESSAGE:', '')
                              .replace(CUSTOMER_MESSAGE_PREFIX, '')
                              .trim()}
                          </p>

                          <p className="mt-3 text-xs text-neutral-500">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      ) : isAdminReply ? (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                          <p className="font-semibold text-emerald-300">Soporte</p>

                          <p className="mt-3 text-sm whitespace-pre-wrap text-neutral-200">
                            {event.message
                              .replace('ADMIN_REPLY:', '')
                              .replace(ADMIN_REPLY_PREFIX, '')
                              .trim()}
                          </p>

                          <p className="mt-3 text-xs text-neutral-500">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-white">
                            {event.message ?? timelineLabels[event.type] ?? event.type}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={timelineBottomRef} />
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
                    <div key={refund.id} className="rounded-2xl border border-white/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm text-neutral-500">Estado</p>

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                              refundStatusStyles[refund.status] ?? ''
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

                      <div className="mt-4">
                        <p className="text-sm text-neutral-500">Productos solicitados</p>
                        <div className="mt-3 space-y-2">
                          {refund.items?.map((refundItem: any) => {
                            const orderItem = order.items.find(
                              (item: any) => item.id === refundItem.orderItemId,
                            );

                            if (!orderItem) return null;

                            return (
                              <div
                                key={refundItem.id}
                                className="flex flex-col gap-3 rounded-xl border border-white/10 p-3 md:flex-row md:items-center md:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-white">
                                    {orderItem.productName}
                                  </p>

                                  <p className="mt-1 text-sm text-neutral-400">
                                    Talla {orderItem.size} ·{' '}
                                    {colorLabels[orderItem.color] ?? orderItem.color}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                                    Compró {orderItem.quantity}
                                  </span>

                                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                                    Devuelve {refundItem.quantity}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {refund.note && (
                        <div className="mt-4">
                          <p className="text-sm text-neutral-500">Comentario cliente</p>

                          <p className="mt-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-neutral-300">
                            {refund.note}
                          </p>
                        </div>
                      )}
                      {refund.status === 'REJECTED' && refund.rejectionReason && (
                        <div className="mt-5 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5">
                          <div className="border-b border-red-500/10 px-4 py-3">
                            <h3 className="text-sm font-semibold text-red-300">
                              Motivo del rechazo
                            </h3>
                          </div>

                          <div className="p-4">
                            <p className="text-sm leading-relaxed text-red-100">
                              {refund.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                      {refund.evidence?.length > 0 && (
                        <div className="mt-5">
                          <p className="mb-3 text-xs tracking-wide text-neutral-500 uppercase">
                            Evidencias adjuntas
                          </p>

                          <p className="mb-3 text-xs text-neutral-500">
                            {refund.evidence.length} fotografía(s) adjunta(s)
                          </p>

                          <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                            {refund.evidence.map((image: any) => (
                              <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedEvidence(image.url)}
                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:shadow-xl hover:shadow-black/40"
                              >
                                <img
                                  src={image.url}
                                  alt="Refund evidence"
                                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {refund.status === 'CUSTOMER_SENT' && (
                        <div className="mt-5 overflow-hidden rounded-2xl border border-sky-500/20 bg-sky-500/5">
                          <div className="border-b border-sky-500/10 px-4 py-3">
                            <h3 className="text-sm font-semibold text-sky-300">
                              📦 Paquete enviado por el cliente
                            </h3>

                            <p className="mt-1 text-xs text-neutral-400">
                              El cliente ha confirmado que ya ha entregado el paquete al
                              transportista.
                            </p>
                          </div>

                          <div className="grid gap-4 p-4 md:grid-cols-3">
                            <div>
                              <p className="text-xs tracking-wide text-neutral-500 uppercase">
                                Transportista
                              </p>

                              <p className="mt-1 font-medium text-white">
                                {refund.carrier || 'No indicado'}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs tracking-wide text-neutral-500 uppercase">
                                Seguimiento
                              </p>

                              <p className="mt-1 font-medium break-all text-white">
                                {refund.trackingNumber || 'No indicado'}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs tracking-wide text-neutral-500 uppercase">
                                Fecha de envío
                              </p>

                              <p className="mt-1 font-medium text-white">
                                {refund.customerSentAt
                                  ? formatDateTime(refund.customerSentAt)
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-neutral-500">
                        <div className="mt-4 flex flex-wrap gap-2">
                          {refund.status === 'PENDING_REVIEW' && (
                            <>
                              <button
                                onClick={() => approveRefund(refund.id)}
                                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white"
                              >
                                Aprobar devolución
                              </button>

                              <button
                                onClick={() => rejectRefund(refund.id)}
                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white"
                              >
                                Rechazar devolución
                              </button>
                            </>
                          )}

                          {refund.status === 'CUSTOMER_SENT' && (
                            <button
                              onClick={() => receivedRefund(refund.id)}
                              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white"
                            >
                              Producto recibido
                            </button>
                          )}
                          {refund.status === 'RECEIVED' && (
                            <button
                              onClick={() => processRefund(refund.id)}
                              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white"
                            >
                              Procesar reembolso
                            </button>
                          )}
                        </div>
                        <div className="pt-4">
                          Solicitud creada el {formatDateTime(refund.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-lg font-semibold text-white">Dirección de envío</h2>

              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-white">{order.fullName}</p>

                <p className="text-neutral-400">{order.addressLine1}</p>

                {order.addressLine2 && <p className="text-neutral-400">{order.addressLine2}</p>}

                <p className="text-neutral-400">
                  {order.postalCode} {order.city}
                </p>

                <p className="text-neutral-400">{countryLabels[order.country] ?? order.country}</p>

                <div className="border-t border-white/10 pt-4">
                  <p className="break-all text-neutral-400">{order.email}</p>

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
                    <p className="text-xs text-neutral-500 uppercase">Transportista</p>

                    <p className="mt-1 text-white">{order.shipment.carrier}</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500 uppercase">Tracking</p>

                    <p className="mt-1 break-all text-white">{order.shipment.trackingNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-500 uppercase">Estado</p>

                    <p className="mt-1 font-medium text-white">
                      {shipmentStatusLabels[order.shipment.status] ?? order.shipment.status}
                    </p>
                  </div>

                  {order.shipment.shippedAt && (
                    <div>
                      <p className="text-xs text-neutral-500 uppercase">Enviado</p>

                      <p className="mt-1 text-white">{formatDateTime(order.shipment.shippedAt)}</p>
                    </div>
                  )}

                  {order.shipment.deliveredAt && (
                    <div>
                      <p className="text-xs text-neutral-500 uppercase">Entregado</p>

                      <p className="mt-1 text-white">
                        {formatDateTime(order.shipment.deliveredAt)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ADMIN ACTIONS */}

            <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-lg font-semibold text-white">Gestión del pedido</h2>
              <button
                onClick={() => setEditOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Editar pedido
              </button>

              <div className="mt-4 flex flex-col gap-3">
                {!order.shipment && order.status === 'PAID' && (
                  <button
                    onClick={() => setShipmentOpen(true)}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
                  >
                    Crear envío
                  </button>
                )}

                {order.shipment?.status === 'SHIPPED' && (
                  <button
                    onClick={markDelivered}
                    className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"
                  >
                    Marcar entregado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {shipmentOpen && (
        <ShipmentModal
          order={order}
          onClose={() => setShipmentOpen(false)}
          onSuccess={async () => {
            setShipmentOpen(false);
            await loadOrder();
          }}
        />
      )}
      {editOpen && order && (
        <EditOrderModal order={order} onClose={() => setEditOpen(false)} onSaved={loadOrder} />
      )}
      {replyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h3 className="text-xl font-semibold text-white">Responder al cliente</h3>

            <p className="mt-2 text-sm text-neutral-400">
              Esta respuesta se enviará por correo electrónico y quedará registrada en el historial
              del pedido.
            </p>

            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={8}
              className="mt-6 w-full rounded-2xl border border-white/10 bg-black p-4 text-white"
              placeholder="Escribe tu respuesta..."
            />

            <div className="mt-5 flex items-center gap-3">
              <input
                id="cancel-link"
                type="checkbox"
                checked={includeCancelLink}
                onChange={(e) => setIncludeCancelLink(e.target.checked)}
                className="h-4 w-4"
              />

              <label htmlFor="cancel-link" className="text-sm text-neutral-300">
                Incluir enlace de cancelación
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setReplyOpen(false);
                  setReplyMessage('');
                  setIncludeCancelLink(false);
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-white"
              >
                Cancelar
              </button>

              <button
                onClick={sendReply}
                disabled={sendingReply}
                className="rounded-xl bg-white px-5 py-3 font-medium text-black"
              >
                {sendingReply ? 'Enviando...' : 'Enviar respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <h3 className="text-xl font-semibold text-white">Rechazar devolución</h3>

            <p className="mt-2 text-sm text-neutral-400">
              Explica claramente al cliente por qué se rechaza la solicitud.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={6}
              className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-black p-4 text-white"
              placeholder="Ej: El producto presenta signos de uso y no cumple las condiciones de devolución..."
            />

            <p className="mt-2 text-right text-xs text-neutral-500">
              {rejectReason.length} caracteres
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason('');
                  setRejectRefundId(null);
                }}
                className="rounded-xl border border-white/10 px-4 py-3 text-white"
              >
                Cancelar
              </button>

              <button
                onClick={confirmRejectRefund}
                className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600"
              >
                Rechazar devolución
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedEvidence && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedEvidence(null)}
        >
          <button
            onClick={() => setSelectedEvidence(null)}
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ×
          </button>

          <img
            src={selectedEvidence}
            alt="Evidence"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain"
          />
        </div>
      )}
    </>
  );
}
