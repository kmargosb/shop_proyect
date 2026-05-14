import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPaymentProvider } from "./payment.factory";
import { getProviderFromMethod } from "./payment-method.mapper";

export const createPaymentIntent = async (
  req: Request,
  res: Response,
) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    let order = await prisma.order.findUnique({
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

    const paymentMethod = method ?? "CARD";

    const paymentProvider =
      getProviderFromMethod(paymentMethod);

    let paymentIntent;

    order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    /* ===============================
       REUSE VALID INTENT
    =============================== */

    if (order.stripePaymentIntentId) {
      paymentIntent =
        await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId,
        );

      if (paymentIntent.status === "succeeded") {
        return res.status(400).json({
          error: "Payment already completed",
        });
      }

      if (
        paymentIntent.status ===
          "requires_payment_method" ||
        paymentIntent.status ===
          "requires_confirmation" ||
        paymentIntent.status === "processing"
      ) {
        console.log(
          "♻️ Reusing existing PaymentIntent:",
          paymentIntent.id,
        );

        return res.json({
          clientSecret: paymentIntent.client_secret,
        });
      }
    }

    /* ===============================
       CREATE NEW PAYMENT INTENT
    =============================== */

    const provider =
      getPaymentProvider(paymentProvider);

    paymentIntent =
      await provider.createPaymentIntent(
        order.totalAmount,
        order.currency,
        order.id,
      );

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentProvider,
        paymentMethod,
        status: "PAYMENT_PROCESSING",
      },
    });

    console.log(
      "✅ PaymentIntent created:",
      paymentIntent.id,
    );

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("🔥 PAYMENT ERROR:", error);

    return res.status(500).json({
      error: "Payment initialization failed",
    });
  }
};

/* =========================================================
   RETRY PAYMENT
========================================================= */

export const retryPaymentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const orderId =
      typeof req.params.orderId === "string"
        ? req.params.orderId
        : req.params.orderId[0];

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada",
      });
    }

    if (order.status === "PAID") {
      return res.status(400).json({
        error: "La orden ya está pagada",
      });
    }

    /* ===============================
       REUSE EXISTING PAYMENT INTENT
    =============================== */

    if (!order.stripePaymentIntentId) {
      return res.status(400).json({
        error: "No existe PaymentIntent",
      });
    }

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

    if (paymentIntent.status === "succeeded") {
      return res.status(400).json({
        error: "Pago ya completado",
      });
    }

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};