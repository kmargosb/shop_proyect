import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPaymentProvider } from "./payment.factory";
import { getProviderFromMethod } from "./payment-method.mapper";

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { orderId, method } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    /* ===============================
       LOAD ORDER
    =============================== */

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

    /* ===============================
       METHOD + PROVIDER
    =============================== */

    const paymentMethod = method ?? "CARD";
    const paymentProvider = getProviderFromMethod(paymentMethod);

    let paymentIntent;

    /* ===============================
       🔥 RELOAD ORDER (ANTI RACE CONDITION)
    =============================== */

    order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    /* ===============================
       REUSE EXISTING INTENT
    =============================== */

    if (order?.stripePaymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId,
      );

      if (paymentIntent.status === "succeeded") {
        return res.status(400).json({
          error: "Payment already completed",
        });
      }

      if (
        paymentIntent.status === "requires_payment_method" ||
        paymentIntent.status === "requires_confirmation" ||
        paymentIntent.status === "processing"
      ) {
        console.log("♻️ Reusing existing PaymentIntent:", paymentIntent.id);

        return res.json({
          clientSecret: paymentIntent.client_secret,
        });
      }

      if (!paymentIntent.metadata?.orderId) {
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
            orderId: order.id,
          },
        });
      }
    } else {
      /* ===============================
         🔥 CREATE NEW INTENT (SAFE)
      =============================== */

      const provider = getPaymentProvider(paymentProvider);

      paymentIntent = await provider.createPaymentIntent(
        order.totalAmount,
        order.currency,
        order.id,
      );

      /* 🔥 CRITICAL: SAVE IMMEDIATELY */

      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          paymentProvider: paymentProvider,
          paymentMethod: paymentMethod,
          status: "PAYMENT_PROCESSING",
        },
      });

      console.log("✅ PaymentIntent created & saved:", paymentIntent.id);
    }

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
