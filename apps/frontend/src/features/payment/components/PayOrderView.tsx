'use client';

import { motion } from 'framer-motion';
import PaymentWrapper from './PaymentWrapper';
import StripePaymentForm from './StripePaymentForm';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/shared/lib/api';
import { socket } from '@/shared/lib/socket';

type Props = {
  orderId: string;
  clientSecret: string | null;
};

export default function PayOrderView({ orderId, clientSecret }: Props) {
  const [secret, setSecret] = useState(clientSecret);

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

      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Checkout</h1>

            <p className="text-base text-neutral-400 md:text-lg">Complete your payment securely</p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl">
            <p className="mb-2 text-sm text-neutral-500">Order ID</p>

            <p className="font-mono text-sm break-all text-neutral-300">{orderId}</p>

            <div className="mt-4 border-t border-white/[0.08] pt-4 text-xs text-neutral-500">
              Powered by Stripe
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>🔒 Secure</span>
            <span>•</span>
            <span>Global payments</span>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/[0.06] blur-3xl" />

          <div className="relative z-10 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:p-8">
            <PaymentWrapper clientSecret={secret}>
              <StripePaymentForm orderId={orderId} />
            </PaymentWrapper>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
