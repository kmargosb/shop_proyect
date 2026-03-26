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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading) return;

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
        setErrorMessage(result.error.message || "Payment failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected payment error:", err);
      setErrorMessage("Unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* PAYMENT ELEMENT */}
      {!elementError ? (
        <div className="bg-black/30 border border-white/[0.08] rounded-xl p-4">
          <PaymentElement
            onLoadError={(err: unknown) => {
              console.error("Stripe load error:", err);
              setElementError(true);
              setErrorMessage("Error loading payment form");
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
        disabled={!stripe || loading || elementError}
        className="w-full py-4 rounded-xl font-medium text-lg bg-white text-black transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay now"}
      </motion.button>

      {/* FOOTER */}
      <p className="text-xs text-neutral-500 text-center">
        Your payment is securely processed with Stripe
      </p>
    </form>
  );
}