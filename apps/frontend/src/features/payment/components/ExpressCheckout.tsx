'use client';

import { ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

type Props = {
  orderId: string;
};

export default function ExpressCheckout({ orderId }: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!stripe || !elements || loading) {
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
        setErrorMessage(result.error.message ?? 'Payment failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Express checkout error:', error);

      setErrorMessage('Unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-neutral-950/70 p-5 shadow-inner backdrop-blur">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-wide text-neutral-200">Express checkout</h3>

        <p className="mt-1 text-xs text-neutral-500">
          Pay faster using your preferred payment method.
        </p>
      </div>

      <ExpressCheckoutElement
        options={{
          buttonHeight: 52,
        }}
        onConfirm={handleConfirm}
      />

      {loading && (
        <p className="mt-3 text-center text-xs text-neutral-500">Processing payment...</p>
      )}

      {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}
    </div>
  );
}
