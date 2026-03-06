import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPaymentProvider } from "./payment.factory";
import { getProviderFromMethod } from "./payment-method.mapper"

export const createPaymentIntent = async (
  req: Request,
  res: Response
) => {
  try {

    const { orderId, method } = req.body

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

    /* ===============================
       DETECTAR METHOD Y PROVIDER
    =============================== */

    const paymentMethod = method ?? "CARD"

    const paymentProvider = getProviderFromMethod(paymentMethod)

    let paymentIntent;

    /* =========================================================
       REUTILIZAR INTENT SI EXISTE
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

      if (!paymentIntent.metadata?.orderId) {
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: { orderId: order.id },
        });
      }

    } else {

      /* =========================================================
         USAR PAYMENT PROVIDER
      ========================================================= */

      const provider = getPaymentProvider(paymentProvider);

      paymentIntent = await provider.createPaymentIntent(
        order.totalAmount,
        order.currency,
        order.id
      );

      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          paymentProvider: paymentProvider,
          paymentMethod: paymentMethod,
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