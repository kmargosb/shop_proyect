import { PaymentProvider } from "@prisma/client"
import { StripeProvider } from "./providers/stripe.provider"

export function getPaymentProvider(provider: PaymentProvider) {

  switch (provider) {

    case "STRIPE":
      return new StripeProvider()

    default:
      throw new Error("Unsupported payment provider")

  }

}