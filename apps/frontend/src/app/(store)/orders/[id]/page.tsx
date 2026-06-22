'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ShipmentStatusCard from '@/features/orders/components/ShipmentStatusCard';
import { socket } from '@/shared/lib/socket';
import type { DashboardUpdatePayload, OrderUpdatedPayload } from '@/shared/lib/socket';
import { toast } from 'sonner';

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
} from 'lucide-react';

import { apiFetch, publicFetch } from '@/shared/lib/api';
import { Button } from '@/shared/ui/button';

type OrderEvent = {
  id: string;
  type: string;
  message?: string;
  createdAt: string;
};

const cancellationReasons: Record<string, string> = {
  WRONG_PRODUCT: 'Wrong Product',
  WRONG_SIZE: 'Wrong Size',
  WRONG_COLOR: 'Wrong Color',
  CHANGED_MIND: 'Changed Mind',
  ACCIDENTAL_ORDER: 'Accidental Order',
  OTHER: 'Other',
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('CUSTOMER_REQUEST');
  const [showSentModal, setShowSentModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sendingRefund, setSendingRefund] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        const queryEmail = searchParams.get('email');

        const storedOrderId = localStorage.getItem('orderEmailOrderId');

        const storedEmail = localStorage.getItem('orderEmail');

        const email = queryEmail || (storedOrderId === id ? storedEmail : null);

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

    const refreshOrder = (payload?: DashboardUpdatePayload | OrderUpdatedPayload) => {
      if (!payload?.orderId || payload.orderId === id) {
        void loadOrder();
      }
    };

    // socket.on("dashboard:update", refreshOrder);
    socket.on('orderUpdated', refreshOrder);

    return () => {
      // socket.off("dashboard:update", refreshOrder);
      socket.off('orderUpdated', refreshOrder);
    };
  }, [id, searchParams]);

  useEffect(() => {
    timelineBottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [order?.events]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-white">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Order not found</h1>

          <p className="mt-4 text-neutral-400">
            This order does not exist or you do not have access to it.
          </p>

          <a href="/shop" className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 text-black">
            Continue shopping
          </a>
        </div>
      </div>
    );
  }

  const adjustments = order?.refunds?.filter((r: any) => r.type === 'ORDER_ADJUSTMENT') || [];

  const returns = order?.refunds?.filter((r: any) => r.type !== 'ORDER_ADJUSTMENT') || [];

  const canDownloadInvoice =
    order.invoice &&
    ['PAID', 'SHIPPED', 'DELIVERED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.status);

  const isPaid = order.status !== 'PENDING' && order.status !== 'PAYMENT_PROCESSING';

  const canContinuePayment = order.status === 'PENDING' || order.status === 'PAYMENT_PROCESSING';

  const markRefundSent = async () => {
    if (!selectedRefund) return;

    if (!carrier.trim()) {
      toast.error('Enter the shipping carrier');
      return;
    }

    if (!trackingNumber.trim()) {
      toast.error('Enter the tracking number');
      return;
    }

    try {
      setSendingRefund(true);

      await apiFetch(`/refunds/${selectedRefund.id}/sent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrier,
          trackingNumber,
        }),
      });

      setShowSentModal(false);

      setCarrier('');
      setTrackingNumber('');
      setSelectedRefund(null);

      const queryEmail = searchParams.get('email');

      const storedOrderId = localStorage.getItem('orderEmailOrderId');

      const storedEmail = localStorage.getItem('orderEmail');

      const email = queryEmail || (storedOrderId === id ? storedEmail : null);

      if (email) {
        const publicRes = await publicFetch(
          `/orders/public/${id}?email=${encodeURIComponent(email)}`,
        );

        const updatedOrder = await publicRes.json();

        setOrder(updatedOrder);
      } else {
        const refreshed = await apiFetch(`/orders/${order.id}`);

        if (refreshed?.ok) {
          const updatedOrder = await refreshed.json();

          setOrder(updatedOrder);
        }
      }

      toast.success('Information submitted');
    } catch (error) {
      console.error(error);

      toast.error('Failed to update return');
    } finally {
      setSendingRefund(false);
    }
  };

  const handleDownloadInvoice = () => {
    const queryEmail = searchParams.get('email');

    const storedOrderId = localStorage.getItem('orderEmailOrderId');

    const storedEmail = localStorage.getItem('orderEmail');

    const email = queryEmail || (storedOrderId === id ? storedEmail : null);

    if (!email) {
      alert('Order email not found');

      return;
    }

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/orders/public/${id}/invoice?email=${email}`,
      '_blank',
    );
  };
  const handleCancelOrder = async () => {
    try {
      setCancelling(true);

      const res = await apiFetch(`/orders/${order.id}/cancel`, {
        method: 'POST',

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

      alert('Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* HERO */}

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-neutral-900 to-black p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.25em] text-neutral-400 uppercase">
                Order
              </div>

              <h1 className="text-4xl font-semibold tracking-tight">
                {isPaid ? 'Payment completed' : 'Order created'}
              </h1>

              <p className="mt-3 text-neutral-400">Order # {order.id.slice(0, 8)}</p>
            </div>

            <div>
              <span
                className={`inline-flex items-center rounded-full border px-5 py-3 text-sm font-medium ${
                  isPaid
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
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
              key: 'PENDING',
              label: 'Order',
            },
            {
              key: 'PAID',
              label: 'Paid',
            },
            {
              key: 'SHIPPED',
              label: 'Shipped',
            },
            {
              key: 'DELIVERED',
              label: 'Delivered',
            },
          ];

          const currentStep = (() => {
            if (order.shipment?.deliveredAt) {
              return 3;
            }

            if (order.shipment?.shippedAt) {
              return 2;
            }

            switch (order.status) {
              case 'PENDING':
              case 'PAYMENT_PROCESSING':
                return 0;

              case 'PAID':
              case 'PARTIALLY_REFUNDED':
              case 'REFUNDED':
                return 1;

              default:
                return 0;
            }
          })();

          return (
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold">Order status</h2>

                <div className="mt-2 space-y-1">
                  <p className="text-sm text-neutral-500">Track the progress of your order</p>

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
                          Sent: {new Date(order.shipment.shippedAt).toLocaleString()}
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
                    <div key={step.key} className="relative flex flex-1 justify-center">
                      <div className="flex flex-col items-center">
                        {/* DOT */}

                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-500 ${
                            active
                              ? 'border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                              : 'border-white/10 bg-white/[0.03] text-neutral-500'
                          } `}
                        >
                          {index + 1}
                        </div>

                        {/* LABEL */}

                        <p
                          className={`mt-2 text-center text-[10px] leading-tight font-medium uppercase ${active ? 'text-white' : 'text-neutral-500'} `}
                        >
                          {step.label}
                        </p>
                      </div>

                      {/* LINE */}

                      {index !== steps.length - 1 && (
                        <div className="absolute top-4 left-1/2 ml-6 h-px w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`absolute top-0 left-0 h-full transition-all duration-700 ${lineActive ? 'w-full bg-white' : 'w-0 bg-white'} `}
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
                <h2 className="text-xl font-semibold">Order Items</h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Products purchased and return status
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-neutral-400">
                {(() => {
                  const totalProducts = order.items.reduce(
                    (sum: number, item: any) => sum + item.quantity,
                    0,
                  );

                  return `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'}`;
                })()}
              </span>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs tracking-[0.2em] text-neutral-600 uppercase">Delivery in</p>

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
                item.refundItems?.reduce((sum: number, ri: any) => sum + ri.quantity, 0) || 0;

              const remainingQuantity = item.quantity - refundedQuantity;

              const isFullyRefunded = remainingQuantity <= 0;

              const isPartiallyRefunded = refundedQuantity > 0 && remainingQuantity > 0;

              const image =
                item.product?.images?.find((img: any) => img.isPrimary)?.url ??
                item.product?.images?.[0]?.url ??
                item.product?.image ??
                null;

              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    {/* LEFT */}

                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {/* IMAGE */}

                      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                        {image ? (
                          <img
                            src={image}
                            alt={item.product?.name || item.productName}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-sm font-semibold text-neutral-500">
                            {(item.product?.name || item.productName)?.slice(0, 2)?.toUpperCase()}
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
                            {item.color && item.size ? ' · ' : ''}
                            {item.size}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-neutral-500">Quantity: {item.quantity}</p>

                        <p className="mt-1 text-xs tracking-[0.2em] text-neutral-600 uppercase">
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
              <h2 className="text-xl font-semibold">Order status</h2>

              <p className="mt-2 text-sm text-neutral-500">Real-time order tracking</p>
            </div>

            <div className="premium-scrollbar relative max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {order.events.map((event: OrderEvent, index: number) => {
                const config = getTimelineConfig(event.type);
                const isCustomerMessage = event.message?.startsWith('CUSTOMER_MESSAGE:');

                const isAdminReply = event.message?.startsWith('ADMIN_REPLY:');

                return (
                  <div
                    key={event.id}
                    className="relative flex gap-3 rounded-xl border border-white/[0.03] bg-white/[0.015] px-3 py-2.5"
                  >
                    {/* CONNECTOR */}

                    {index !== order.events.length - 1 && (
                      <div className="absolute top-8 left-[13px] h-6 w-px bg-gradient-to-b from-white/20 to-transparent" />
                    )}

                    {/* ICON */}

                    <div
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border md:h-11 md:w-11 ${config.className}`}
                    >
                      <config.icon size={13} />
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1">
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs font-semibold">
                          {isCustomerMessage
                            ? 'MESSAGE SENT'
                            : isAdminReply
                              ? 'SUPPORT REPLY'
                              : config.label}
                        </p>

                        <p className="text-[10px] text-neutral-600">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {event.message && (
                        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                          {event.message
                            .replace('CUSTOMER_MESSAGE:', '')
                            .replace('ADMIN_REPLY:', '')
                            .replace('WRONG_PRODUCT', cancellationReasons.WRONG_PRODUCT)
                            .replace('WRONG_SIZE', cancellationReasons.WRONG_SIZE)
                            .replace('WRONG_COLOR', cancellationReasons.WRONG_COLOR)
                            .replace('CHANGED_MIND', cancellationReasons.CHANGED_MIND)
                            .replace('ACCIDENTAL_ORDER', cancellationReasons.ACCIDENTAL_ORDER)
                            .replace('OTHER', cancellationReasons.OTHER)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="pointer-events-none absolute bottom-0 left-0 w-full bg-gradient-to-t from-neutral-950" />
              <div ref={timelineBottomRef} />
            </div>
          </div>
        )}

        {/* REFUNDS */}

        {adjustments.length > 0 && (
          <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="text-xl font-semibold text-emerald-300">Order adjustments</h2>

            <p className="mt-2 text-sm text-emerald-200/70">
              Changes were made to your order before shipment.
            </p>

            <div className="mt-5 space-y-3">
              {adjustments.map((refund: any) => (
                <div
                  key={refund.id}
                  className="rounded-2xl border border-emerald-500/20 bg-black/30 p-4"
                >
                  <p className="font-medium text-white">Automatic refund issued</p>

                  <p className="mt-1 text-2xl font-bold text-emerald-300">
                    €{(refund.amount / 100).toFixed(2)}
                  </p>

                  <p className="mt-2 text-sm text-neutral-400">No return is required.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {returns.length > 0 && (
          <div className="rounded-[28px] border border-white/10 bg-neutral-950 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Returns</h2>

              <p className="mt-2 text-sm text-neutral-500">Status of your return requests</p>
            </div>

            <div className="space-y-4">
              {returns.map((refund: any) => (
                <div
                  key={refund.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-5 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs tracking-[0.2em] text-neutral-500 uppercase">Returns</p>

                      <p className="font-semibold text-white">
                        #{refund.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-300">
                      {refund.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Request #{refund.id.slice(0, 8)}</span>

                    <span className="text-xs text-neutral-400">
                      {getRefundStatusLabel(refund.status)}
                    </span>
                  </div>

                  {refund.note && <p className="mt-3 text-sm text-neutral-500">{refund.note}</p>}
                  {refund.status === 'REJECTED' && refund.rejectionReason && (
                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-sm font-semibold text-red-300">Request rejected</p>

                      <p className="mt-2 text-sm text-red-100">{refund.rejectionReason}</p>
                    </div>
                  )}

                  {refund.status === 'CUSTOMER_SENT' && (
                    <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-sm text-blue-300">Carrier: {refund.carrier}</p>

                      <p className="text-sm text-blue-300">Tracking: {refund.trackingNumber}</p>

                      <p className="mt-2 text-xs text-neutral-500">
                        Sent on {new Date(refund.customerSentAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}

                  {refund.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setSelectedRefund(refund);
                        setShowSentModal(true);
                      }}
                      className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
                    >
                      I have shipped the package
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex flex-col gap-4 md:flex-row">
          {canDownloadInvoice && (
            <Button className="h-12 w-full rounded-2xl" onClick={handleDownloadInvoice}>
              Download invoice
            </Button>
          )}

          {canContinuePayment && (
            <Button
              className="h-12 w-full rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400"
              onClick={async () => {
                try {
                  const res = await apiFetch(`/api/payments/retry/${order.id}`, {
                    method: 'POST',
                  });

                  if (!res || !res.ok) {
                    throw new Error();
                  }

                  const data = await res.json();
                  console.log('RETRY PAYMENT', data);

                  router.push(`/orders/${order.id}/pay?clientSecret=${data.clientSecret}`);
                } catch {
                  alert('Unable to continue payment');
                }
              }}
            >
              Continue payment
            </Button>
          )}

          <Button
            className="h-12 w-full rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300"
            onClick={() => {
              const queryEmail = searchParams.get('email');

              const storedOrderId = localStorage.getItem('orderEmailOrderId');

              const storedEmail = localStorage.getItem('orderEmail');

              const email = queryEmail || (storedOrderId === id ? storedEmail : null);

              const url = email
                ? `/orders/${order.id}/help?email=${encodeURIComponent(email)}`
                : `/orders/${order.id}/help`;

              router.push(url);
            }}
          >
            Need Help?
          </Button>

          <Button
            className="h-12 w-full rounded-2xl bg-white text-black hover:bg-neutral-200"
            onClick={() => router.push('/shop')}
          >
            Continue shopping
          </Button>
        </div>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-2xl font-semibold">Cancel Order</h2>

              <p className="mt-3 text-sm text-neutral-400">
                This action will issue a refund and restore reserved stock.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm text-neutral-400">Reason</label>

                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                >
                  <option value="WRONG_PRODUCT">Wrong Product</option>
                  <option value="WRONG_SIZE">Wrong Size</option>
                  <option value="WRONG_COLOR">Wrong Color</option>
                  <option value="CHANGED_MIND">Changed Mind</option>
                  <option value="ACCIDENTAL_ORDER">Accidental Order</option>
                  <option value="Wrong shipping address">Wrong Shipping Address</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="mt-6 flex gap-3 text-black">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCancelModal(false)}
                >
                  Back
                </Button>

                <Button
                  className="w-full border border-red-500/20 bg-red-500/10 text-red-300"
                  disabled={cancelling}
                  onClick={async () => {
                    setShowCancelModal(false);

                    await handleCancelOrder();
                  }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {showSentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-neutral-950 p-6">
              <h2 className="text-xl font-semibold">I have sent the package</h2>

              <p className="mt-2 text-sm text-neutral-500">
                Enter the shipping company (Correos, MRW, SEUR, DHL, etc.) and the tracking number.
              </p>
              <span className="text-xs">
                Keep the shipping receipt until the return is processed.
              </span>

              <div className="mt-6 space-y-4">
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Correos"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                />

                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="PQ123456789ES"
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="w-full text-black"
                  onClick={() => {
                    setShowSentModal(false);
                  }}
                >
                  Cancel
                </Button>

                <Button className="w-full" disabled={sendingRefund} onClick={markRefundSent}>
                  {sendingRefund ? 'Sending...' : 'Confirm'}
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
    case 'ORDER_CREATED':
      return {
        label: 'ORDER CREATED',
        icon: Package,
        className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
      };

    case 'PAYMENT_SUCCEEDED':
      return {
        label: 'PAYMENT SUCCEEDED',
        icon: CheckCircle2,
        className: 'border-green-500/20 bg-green-500/10 text-green-400',
      };

    case 'PAYMENT_FAILED':
      return {
        label: 'PAYMENT FAILED',
        icon: XCircle,
        className: 'border-red-500/20 bg-red-500/10 text-red-400',
      };

    case 'PAYMENT_PROCESSING':
      return {
        label: 'PAYMENT PROCESSING',
        icon: CreditCard,
        className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
      };

    case 'ORDER_SHIPPED':
      return {
        label: 'ORDER SHIPPED',
        icon: Truck,
        className: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
      };

    case 'ORDER_DELIVERED':
      return {
        label: 'ORDER DELIVERED',
        icon: CheckCircle2,
        className: 'border-green-500/20 bg-green-500/10 text-green-400',
      };

    case 'REFUND_CREATED':
      return {
        label: 'REFUND CREATED',
        icon: RefreshCcw,
        className: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
      };

    case 'REFUND_COMPLETED':
      return {
        label: 'REFUND COMPLETED',
        icon: RefreshCcw,
        className: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
      };

    case 'ORDER_UPDATED':
      return {
        label: 'ORDER UPDATED',
        icon: RefreshCcw,
        className: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
      };

    case 'ORDER_ADJUSTED':
      return {
        label: 'ORDER ADJUSTED',
        icon: RefreshCcw,
        className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      };

    case 'ORDER_CANCELLED':
      return {
        label: 'ORDER CANCELLED',
        icon: XCircle,
        className: 'border-red-500/20 bg-red-500/10 text-red-400',
      };

    default:
      return {
        label: 'UPDATE',
        icon: Clock3,
        className: 'border-white/10 bg-white/5 text-white',
      };
  }
}

function getRefundStatusLabel(status: string) {
  switch (status) {
    case 'PENDING_REVIEW':
      return 'Pending review';

    case 'APPROVED':
      return 'Approved';

    case 'CUSTOMER_SENT':
      return 'Package shipped';

    case 'RECEIVED':
      return 'Package received';

    case 'SUCCEEDED':
      return 'Refund completed';

    case 'REJECTED':
      return 'Request rejected';

    default:
      return status;
  }
}
