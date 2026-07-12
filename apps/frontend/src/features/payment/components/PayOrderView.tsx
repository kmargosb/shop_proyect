'use client';

import { motion } from 'framer-motion';
import PaymentWrapper from './PaymentWrapper';
import StripePaymentForm from './StripePaymentForm';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';
import { useOrder } from '@/features/orders/hooks/useOrder';
import PaymentSummary from './PaymentSummary';

type Props = {
  orderId: string;
  clientSecret: string | null;
};

export default function PayOrderView({ orderId, clientSecret }: Props) {
  const [secret, setSecret] = useState(clientSecret);
  const { data: order, isPending } = useOrder(orderId);

  useEffect(() => {
    if (secret) return;

    const recover = async () => {
      try {
        const res = await apiFetch(`/payment/retry/${orderId}`, {
          method: 'POST',
        });

        if (!res?.ok) return;

        const data = await res.json();

        setSecret(data.clientSecret);
      } catch (error) {
        console.error(error);
      }
    };

    recover();
  }, [orderId, secret]);

  useEffect(() => {
    const handler = ({ orderId: updatedOrderId }: { orderId: string }) => {
      if (updatedOrderId !== orderId) return;

      window.location.reload();
    };

    socket.on('orderCancelled', handler);

    return () => {
      socket.off('orderCancelled', handler);
    };
  }, [orderId]);

  if (isPending || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="space-y-4 text-center">
          <p className="text-lg">Recovering your payment...</p>

          <a href="/shop" className="text-neutral-400 underline hover:text-white">
            Volver a la tienda
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center overflow-x-hidden bg-[#0A0A0A] px-4 py-6 text-white">
      {/* BACKGROUND LIGHT */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-200px] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-white/5 blur-[160px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[420px_1fr]">
        {/* LEFT */}
        <motion.div
          className="self-start lg:sticky lg:top-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PaymentSummary order={order} />
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/[0.06] blur-3xl" />

          <div className="relative z-10 mb-6">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Complete your purchase
            </h1>

            <p className="mt-2 text-sm text-neutral-400 md:text-base">
              Secure payment powered by Stripe. Your order will be confirmed instantly after
              payment.
            </p>
          </div>

          <div className="relative z-10 max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:p-8">
            <PaymentWrapper clientSecret={secret}>
              <StripePaymentForm orderId={orderId} />
            </PaymentWrapper>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
