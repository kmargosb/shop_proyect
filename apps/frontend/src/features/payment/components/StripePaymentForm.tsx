'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const checkoutData =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('checkoutData') ?? '{}') : {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading || !elementReady) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const checkoutData = localStorage.getItem('checkoutData');

      if (checkoutData) {
        try {
          const parsed = JSON.parse(checkoutData);

          if (parsed?.email) {
            localStorage.setItem('orderEmail', parsed.email);
            localStorage.setItem('orderEmailOrderId', orderId);
          }
        } catch {}
      }
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?paid=true`,
        },
      });

      if (result.error) {
        console.log('STRIPE ERROR', result.error);
        const message = result.error.message ?? '';

        if (message.includes('status of canceled') || message.includes('PaymentIntent')) {
          setErrorMessage('Este pedido ha expirado y ya no puede ser pagado.');
        } else {
          setErrorMessage(message || 'Payment failed');
        }

        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Unexpected payment error:', err);
      setErrorMessage('Unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-6 overflow-hidden">
      {/* PAYMENT ELEMENT */}
      {!elementError ? (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/70 p-4 shadow-inner backdrop-blur">
          <p className="mb-4 text-sm font-medium text-neutral-300">Card details</p>
          <PaymentElement
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },

              business: {
                name: 'CAMARGUETTE',
              },

              defaultValues: {
                billingDetails: {
                  name: `${checkoutData.firstName ?? ''} ${checkoutData.lastName ?? ''}`.trim(),
                  email: checkoutData.email ?? '',
                },
              },
            }}
            onReady={() => {
              setElementReady(true);
            }}
            onLoadError={() => {
              setElementError(true);

              setErrorMessage('Esta sesión de pago ya no es válida');

              setTimeout(() => {
                window.location.href = '/shop';
              }, 2500);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-neutral-400">No se pudo cargar el formulario de pago</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-neutral-400 underline hover:text-white"
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
          className="text-sm text-red-400"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* SUBMIT BUTTON */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        type="submit"
        disabled={!stripe || !elements || !elementReady || loading || elementError}
        className="w-full rounded-xl bg-white py-4 text-lg font-medium text-black transition disabled:opacity-50"
      >
        {loading
          ? 'Processing payment...'
          : !elementReady
            ? 'Loading secure payment...'
            : 'Complete payment'}
      </motion.button>

      {/* FOOTER */}
      <p className="text-center text-xs text-neutral-500">
        Protected by Stripe • SSL encrypted • PCI DSS compliant
      </p>
    </form>
  );
}
