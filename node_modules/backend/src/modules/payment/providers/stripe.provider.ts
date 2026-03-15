import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover"
})

export class StripeProvider {

  async createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<Stripe.PaymentIntent> {

    console.log("Creating Stripe PaymentIntent for order:", orderId)

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency,

        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never"
        },

        metadata: {
          orderId
        }

      },
      {
        idempotencyKey: `payment_intent_${orderId}`
      }
    )

    console.log("Stripe PaymentIntent created:", paymentIntent.id)

    return paymentIntent
  }

}