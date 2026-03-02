import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const createPaymentIntent = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    console.log("ORDER TOTAL:", order.totalAmount);

    /**
     * reutilizar intent existente
     */
    if (order.stripePaymentIntentId) {
      const existingIntent =
        await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId
        );

      return res.json({
        clientSecret: existingIntent.client_secret,
      });
    }

    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: order.totalAmount,
        currency: order.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: order.id,
        },
      });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: "PAYMENT_PROCESSING",
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error);

    res.status(500).json({
      error: "Payment initialization failed",
    });
  }
};