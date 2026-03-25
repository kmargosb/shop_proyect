"use client";

import { motion } from "framer-motion";
import PaymentWrapper from "../components/PaymentWrapper";
import StripePaymentForm from "../components/StripePaymentForm";

type Props = {
  orderId: string;
  clientSecret: string;
};

export default function PayOrderPage({
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
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 overflow-hidden">
      
      {/* BACKGROUND LIGHT */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 blur-[160px] rounded-full" />
      </div>

      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight">
              Checkout
            </h1>

            <p className="text-neutral-400 text-lg">
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
          <div className="absolute inset-0 bg-white/[0.06] blur-3xl rounded-3xl" />

          <div className="relative bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <PaymentWrapper clientSecret={clientSecret}>
              <StripePaymentForm orderId={orderId} />
            </PaymentWrapper>
          </div>
        </motion.div>
      </div>
    </main>
  );
}