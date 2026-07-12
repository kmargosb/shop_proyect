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
            colorBackground: '#111111',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            borderRadius: '14px',
            spacingUnit: '4px',
            fontSizeBase: '15px',
          },
        },
        loader: 'auto',
      }}
    >
      {children}
    </Elements>
  );
}
