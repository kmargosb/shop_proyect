'use client';

import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe';

type Props = {
  clientSecret: string;
  children: React.ReactNode;
};

export default function PaymentWrapper({ clientSecret, children }: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,

        appearance: {
          theme: 'night',

          variables: {
            colorPrimary: '#ffffff',
            colorBackground: '#0b0b0b',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            borderRadius: '14px',
            spacingUnit: '4px',
            fontSizeBase: '15px',
          },

          rules: {
            /* -------------------------------------------- */
            /* INPUTS                                       */
            /* -------------------------------------------- */

            '.Input': {
              border: '1px solid rgba(255,255,255,0.10)',
              backgroundColor: 'rgba(255,255,255,0.025)',
              boxShadow: 'none',
            },

            '.Input:focus': {
              border: '1px solid rgba(255,255,255,0.35)',
              boxShadow: 'none',
            },

            /* -------------------------------------------- */
            /* LABELS                                       */
            /* -------------------------------------------- */

            '.Label': {
              color: 'rgba(255,255,255,0.72)',
            },

            /* -------------------------------------------- */
            /* PAYMENT TABS                                 */
            /* -------------------------------------------- */

            '.Tab': {
              minHeight: '52px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.025)',
              color: '#ffffff',
              boxShadow: 'none',
            },

            '.Tab:hover': {
              border: '1px solid rgba(255,255,255,0.20)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#ffffff',
            },

            /* SOLO BORDE PARA EL MÉTODO SELECCIONADO */

            '.Tab--selected': {
              border: '1px solid rgba(255,255,255,0.75)',
              backgroundColor: 'rgba(255,255,255,0.025)',
              color: '#ffffff',
              boxShadow: 'none',
            },

            '.Tab--selected:hover': {
              border: '1px solid rgba(255,255,255,0.90)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#ffffff',
            },

            /* -------------------------------------------- */
            /* TEXT INSIDE SELECTED TAB                     */
            /* -------------------------------------------- */

            '.Tab--selected .Text': {
              color: '#ffffff',
            },

            '.Tab--selected .Icon': {
              color: '#ffffff',
            },
          },
        },

        loader: 'auto',
      }}
    >
      {children}
    </Elements>
  );
}
