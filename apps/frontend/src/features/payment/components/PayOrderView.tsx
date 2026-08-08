'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';

import PaymentWrapper from './PaymentWrapper';
import PaymentSummary from './PaymentSummary';
import StripePaymentForm from './StripePaymentForm';

import { usePaymentSummary } from '@/features/orders/hooks/usePaymentSummary';

type Props = {
  orderId: string;
  clientSecret: string | null;
};

export default function PayOrderView({ orderId, clientSecret }: Props) {
  const [secret, setSecret] = useState(clientSecret);

  const email =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;

  const { order, loading, error } = usePaymentSummary(orderId, email);

  /*
   * --------------------------------------------------
   * RECOVER PAYMENT
   * --------------------------------------------------
   */

  useEffect(() => {
    if (secret) return;

    let cancelled = false;

    const recover = async () => {
      try {
        const res = await apiFetch(`/payment/retry/${orderId}`, {
          method: 'POST',
        });

        if (!res?.ok) {
          return;
        }

        const data = await res.json();

        if (!cancelled && data?.clientSecret) {
          setSecret(data.clientSecret);
        }
      } catch (error) {
        console.error(error);
      }
    };

    recover();

    return () => {
      cancelled = true;
    };
  }, [orderId, secret]);

  /*
   * --------------------------------------------------
   * ORDER CANCELLATION
   * --------------------------------------------------
   */

  useEffect(() => {
    const handler = ({ orderId: updatedOrderId }: { orderId: string }) => {
      if (updatedOrderId !== orderId) {
        return;
      }

      window.location.reload();
    };

    socket.on('orderCancelled', handler);

    return () => {
      socket.off('orderCancelled', handler);
    };
  }, [orderId]);

  /*
   * --------------------------------------------------
   * PAYMENT RECOVERY SCREEN
   * --------------------------------------------------
   */

  if (!secret) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0A0A0A] px-6 text-white">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />

            <p className="text-base font-medium">Recovering your payment...</p>

            <p className="mt-2 text-sm text-neutral-500">Please wait a moment.</p>

            <a
              href="/shop"
              className="mt-6 inline-block text-sm text-neutral-400 underline underline-offset-4 transition-colors hover:text-white"
            >
              Volver a la tienda
            </a>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * PAYMENT PAGE
   * --------------------------------------------------
   */

  return (
    <main className="min-h-dvh bg-[#0A0A0A] px-4 py-6 text-white sm:px-6 sm:py-8 lg:py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-10">
        {/* -------------------------------------------- */}
        {/* ORDER SUMMARY                                 */}
        {/* -------------------------------------------- */}

        <aside className="self-start lg:sticky lg:top-8">
          {error ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
              <p className="text-sm text-neutral-400">We couldn&apos;t load the order summary.</p>
            </div>
          ) : order ? (
            <PaymentSummary order={order} />
          ) : (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
              <p className="text-sm text-neutral-400">
                {loading ? 'Loading order summary...' : 'Order unavailable.'}
              </p>
            </div>
          )}
        </aside>

        {/* -------------------------------------------- */}
        {/* PAYMENT                                      */}
        {/* -------------------------------------------- */}

        <section className="min-w-0">
          {/* HEADER */}

          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Complete your purchase
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              Secure payment powered by Stripe. Your order will be confirmed instantly after
              payment.
            </p>
          </div>

          {/* STRIPE CONTAINER */}

          <div className="w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:p-5 lg:p-7">
            <PaymentWrapper clientSecret={secret}>
              <StripePaymentForm orderId={orderId} />
            </PaymentWrapper>
          </div>
        </section>
      </div>
    </main>
  );
}
