"use client";

import { useEffect, useState } from "react";
import PaymentWrapper from "../components/PaymentWrapper";
import StripePaymentForm from "../components/StripePaymentForm";

type Props = {
  orderId: string;
};

export default function PayOrderPage({ orderId }: Props) {
  const [clientSecret, setClientSecret] =
    useState<string | null>(null);

  useEffect(() => {
    async function createIntent() {
      const res = await fetch(
        "http://localhost:4000/api/payments/create-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const data = await res.json();

      if (!data.clientSecret) {
        throw new Error("No client secret received");
      }

      setClientSecret(data.clientSecret);
    }

    if (orderId) {
      createIntent();
    }
  }, [orderId]);

  if (!clientSecret) return <p>Cargando pago...</p>;

  return (
    <PaymentWrapper clientSecret={clientSecret}>
      <StripePaymentForm orderId={orderId} />
    </PaymentWrapper>
  );
}