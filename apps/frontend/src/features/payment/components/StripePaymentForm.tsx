'use client';

import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
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
  const [expressReady, setExpressReady] = useState(false);

  const checkoutData =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('checkoutData') ?? '{}') : {};

  /**
   * ------------------------------------------------------------
   * NORMAL PAYMENT
   * ------------------------------------------------------------
   */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading || !elementReady) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const storedCheckoutData = localStorage.getItem('checkoutData');

      if (storedCheckoutData) {
        try {
          const parsed = JSON.parse(storedCheckoutData);

          if (parsed?.email) {
            localStorage.setItem('orderEmail', parsed.email);
            localStorage.setItem('orderEmailOrderId', orderId);
          }
        } catch {
          // Ignore malformed local checkout data.
        }
      }

      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}?paid=true`,
        },
      });

      if (result.error) {
        const message = result.error.message ?? '';

        if (message.includes('status of canceled') || message.includes('PaymentIntent')) {
          setErrorMessage('Este pedido ha expirado y ya no puede ser pagado.');
        } else {
          setErrorMessage(message || 'Payment failed');
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected payment error:', error);

      setErrorMessage('Unexpected error occurred');
      setLoading(false);
    }
  };

  /**
   * ------------------------------------------------------------
   * EXPRESS CHECKOUT
   * ------------------------------------------------------------
   *
   * Apple Pay / Google Pay / Link / PayPal etc.
   * Stripe decide cuáles son elegibles para cada dispositivo.
   */

  const handleExpressConfirm = async () => {
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
        const message = result.error.message ?? '';

        if (message.includes('status of canceled') || message.includes('PaymentIntent')) {
          setErrorMessage('Este pedido ha expirado y ya no puede ser pagado.');
        } else {
          setErrorMessage(message || 'Payment failed');
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected express payment error:', error);

      setErrorMessage('Unexpected error occurred');
      setLoading(false);
    }
  };

  /**
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-6 overflow-hidden">
      {/* ====================================================== */}
      {/* EXPRESS CHECKOUT                                      */}
      {/* ====================================================== */}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium text-white">Quick checkout</h2>

          <p className="text-xs text-neutral-500">
            Use a saved payment method for a faster checkout.
          </p>
        </div>

        <div
          className={[
            'overflow-hidden rounded-2xl border border-white/[0.08]',
            'bg-white/[0.025] p-4',
            'transition-all duration-300',
            expressReady ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <ExpressCheckoutElement
            options={{
              buttonHeight: 48,

              paymentMethods: {
                applePay: 'always',
                googlePay: 'always',
              },

              layout: {
                maxColumns: 2,
                maxRows: 2,
                overflow: 'auto',
              },
            }}
            onReady={() => {
              setExpressReady(true);
            }}
            onConfirm={handleExpressConfirm}
          />
        </div>
      </section>

      {/* ====================================================== */}
      {/* DIVIDER                                               */}
      {/* ====================================================== */}

      <div className="relative flex items-center">
        <div className="h-px flex-1 bg-white/[0.08]" />

        <span className="px-4 text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase">
          or pay another way
        </span>

        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      {/* ====================================================== */}
      {/* PAYMENT ELEMENT                                       */}
      {/* ====================================================== */}

      {!elementError ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-white">Payment method</h2>

            <p className="text-xs text-neutral-500">Choose your preferred payment method.</p>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950/70 p-4 shadow-inner backdrop-blur md:p-5">
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
        </section>
      ) : (
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 text-center">
          <p className="text-sm text-neutral-400">No se pudo cargar el formulario de pago</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm text-neutral-400 underline underline-offset-4 transition hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ====================================================== */}
      {/* ERROR                                                 */}
      {/* ====================================================== */}

      {errorMessage && !elementError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* ====================================================== */}
      {/* SUBMIT                                                */}
      {/* ====================================================== */}

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        type="submit"
        disabled={!stripe || !elements || !elementReady || loading || elementError}
        className="w-full rounded-xl bg-white py-4 text-base font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg"
      >
        {loading
          ? 'Processing payment...'
          : !elementReady
            ? 'Loading secure payment...'
            : 'Complete payment'}
      </motion.button>

      {/* ====================================================== */}
      {/* FOOTER                                                 */}
      {/* ====================================================== */}

      <p className="text-center text-[11px] leading-relaxed text-neutral-500">
        Protected by Stripe • SSL encrypted • PCI DSS compliant
      </p>
    </form>
  );
}
