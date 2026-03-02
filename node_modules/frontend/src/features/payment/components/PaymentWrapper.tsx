"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe";

export default function PaymentWrapper({
  clientSecret,
  children,
}: any) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      {children}
    </Elements>
  );
}