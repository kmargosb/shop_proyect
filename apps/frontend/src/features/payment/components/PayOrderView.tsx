"use client";

import { motion } from "framer-motion";
import PaymentWrapper from "./PaymentWrapper";
import StripePaymentForm from "./StripePaymentForm";

type Props = {
  orderId: string;
  clientSecret: string;
};

export default function PayOrderView({
  orderId,
  clientSecret,
}: Props) {
  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center space-y-4">
          <p className="text-lg">Payment session expired</p>

          <a
            href="/shop"
            className="underline text-neutral-400 hover:text-white"
          >
            Volver a la tienda
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="relative overflow-x-hidden bg-[#0A0A0A] text-white px-4 py-6 min-h-[calc(100vh-64px)] flex items-center">
      
      {/* BACKGROUND LIGHT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 blur-[160px] rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Checkout
            </h1>

            <p className="text-neutral-400 text-base md:text-lg">
              Complete your payment securely
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-6 rounded-2xl">
            <p className="text-sm text-neutral-500 mb-2">
              Order ID
            </p>

            <p className="text-sm font-mono text-neutral-300 break-all">
              {orderId}
            </p>

            <div className="mt-4 pt-4 border-t border-white/[0.08] text-xs text-neutral-500">
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
          initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 pointer-events-none bg-white/[0.06] blur-3xl rounded-3xl" />

          <div className="relative z-10 bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-4 md:p-8 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <PaymentWrapper clientSecret={clientSecret}>
              <StripePaymentForm orderId={orderId} />
            </PaymentWrapper>
          </div>
        </motion.div>
      </div>
    </main>
  );
}