import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const createPaymentIntent = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    if (order.status === "PAID") {
      return res.status(400).json({
        error: "Order already paid",
      });
    }

    let paymentIntent;

    /* =========================================================
       REUTILIZAR INTENT SI EXISTE Y NO ESTÁ COMPLETADO
    ========================================================= */

    if (order.stripePaymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );

      if (paymentIntent.status === "succeeded") {
        return res.status(400).json({
          error: "Payment already completed",
        });
      }

      // 🔐 Asegurarnos que metadata existe
      if (!paymentIntent.metadata?.orderId) {
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: { orderId: order.id },
        });
      }

    } else {

      /* =========================================================
         CREAR NUEVO PAYMENT INTENT
      ========================================================= */

      paymentIntent = await stripe.paymentIntents.create({
        amount: order.totalAmount,
        currency: order.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: order.id,   // 🔥 MUY IMPORTANTE
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          status: "PAYMENT_PROCESSING",
        },
      });
    }

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("🔥 STRIPE ERROR:", error);

    return res.status(500).json({
      error: "Payment initialization failed",
    });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.stripePaymentIntentId) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PAID") {
      return res.status(400).json({ error: "Order not paid" });
    }

    // Crear refund en Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    // Actualizar orden
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "REFUNDED",
      },
    });

    res.json({
      success: true,
      refundId: refund.id,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Refund failed" });
  }
};