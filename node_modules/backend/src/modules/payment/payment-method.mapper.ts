import { PaymentMethod, PaymentProvider } from "@prisma/client"

export function getProviderFromMethod(
  method: PaymentMethod
): PaymentProvider {

  switch (method) {

    case "CARD":
    case "BIZUM":
    case "APPLE_PAY":
    case "GOOGLE_PAY":
      return "STRIPE"

    case "PAYPAL":
      return "PAYPAL"

    case "KLARNA":
      return "KLARNA"

    default:
      throw new Error("Unsupported payment method")

  }

}