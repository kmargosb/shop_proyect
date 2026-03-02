import { Request, Response } from "express";
import { stripe } from "@/lib/stripe";
import { updateOrderStatus } from "@/modules/orders/order.service";

export const stripeWebhook = async (
  req: Request,
  res: Response
) => {
  const sig = req.headers["stripe-signature"]!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature failed");
    return res.status(400).send("Webhook error");
  }

  /**
   * PAYMENT SUCCESS
   */
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent: any = event.data.object;

    const orderId = paymentIntent.metadata.orderId;

    console.log("✅ Payment succeeded:", orderId);

    await updateOrderStatus(orderId, "PAID");
  }

  /**
   * PAYMENT FAILED
   */
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent: any = event.data.object;

    const orderId = paymentIntent.metadata.orderId;

    console.log("❌ Payment failed:", orderId);

    await updateOrderStatus(orderId, "FAILED");
  }

  res.json({ received: true });
};