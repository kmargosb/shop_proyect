import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover"
})

export class StripeProvider {

  async createPaymentIntent(
    amount: number,
    currency: string,
    orderId: string
  ) {

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        orderId
      }
    })

    return paymentIntent

  }

}