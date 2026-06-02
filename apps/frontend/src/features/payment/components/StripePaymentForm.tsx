"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

type Props = {
  orderId: string;
};

export default function StripePaymentForm({ orderId }: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elementError, setElementError] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading || !elementReady) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?paid=true`,
        },
      });

      if (result.error) {
        console.log("STRIPE ERROR", result.error);
        const message = result.error.message ?? "";

        if (
          message.includes("status of canceled") ||
          message.includes("PaymentIntent")
        ) {
          setErrorMessage("Este pedido ha expirado y ya no puede ser pagado.");
        } else {
          setErrorMessage(message || "Payment failed");
        }

        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Unexpected payment error:", err);
      setErrorMessage("Unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-full overflow-hidden space-y-6"
    >
      {/* PAYMENT ELEMENT */}
      {!elementError ? (
        <div className="w-full max-w-full overflow-hidden bg-black/30 border border-white/[0.08] rounded-xl p-3 md:p-4">
          <PaymentElement
            onReady={() => {
              setElementReady(true);
            }}
            onLoadError={() => {
              setElementError(true);

              setErrorMessage("Esta sesión de pago ya no es válida");

              setTimeout(() => {
                window.location.href = "/shop";
              }, 2500);
            }}
          />
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-400">
            No se pudo cargar el formulario de pago
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm underline text-neutral-400 hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && !elementError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* SUBMIT BUTTON */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        type="submit"
        disabled={
          !stripe || !elements || !elementReady || loading || elementError
        }
        className="w-full py-4 rounded-xl font-medium text-lg bg-white text-black transition disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : !elementReady
            ? "Loading payment..."
            : "Pay now"}
      </motion.button>

      {/* FOOTER */}
      <p className="text-xs text-neutral-500 text-center">
        Your payment is securely processed with Stripe
      </p>
    </form>
  );
}
