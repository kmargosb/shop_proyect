import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/modules/email/sendOrderEmail";

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed.");
    return res.status(400).send("Webhook Error");
  }

  /* =========================================================
     PAYMENT SUCCESS
  ========================================================= */

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;

    try {
      // Buscar orden por PaymentIntent
      let order = await prisma.order.findFirst({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        include: { invoice: true },
      });

      // Fallback usando metadata
      if (!order && paymentIntent.metadata?.orderId) {
        order = await prisma.order.findUnique({
          where: { id: paymentIntent.metadata.orderId },
          include: { invoice: true },
        });
      }

      if (!order) {
        console.error("⚠ Order not linked to PaymentIntent:", paymentIntent.id);
        return res.json({ received: true });
      }

      // Validación de seguridad
      if (
        order.totalAmount !== paymentIntent.amount ||
        order.currency !== paymentIntent.currency
      ) {
        console.error("❌ Amount mismatch detected.");
        return res.json({ received: true });
      }

      // Idempotencia
      if (order.status === "PAID") {
        console.log("⚠ Duplicate webhook ignored.");
        return res.json({ received: true });
      }

      // Actualizar orden
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // Registrar transacción de pago
      await prisma.orderTransaction.create({
        data: {
          orderId: order.id,
          type: "PAYMENT",
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      console.log("✅ Order marked as PAID:", order.id);

      // Crear invoice si no existe
      if (!order.invoice) {
        await prisma.invoice.create({
          data: {
            orderId: order.id,
            invoiceNumber: `INV-${Date.now()}`,
            totalAmount: order.totalAmount,
            customerEmail: order.email, // 🔥 ESTE ERA EL ERROR
          },
        });
      }

      // Enviar email
      await sendOrderConfirmationEmail(order.id);
      console.log("📧 Confirmation email sent.");
    } catch (err) {
      console.error("🔥 Error processing succeeded webhook:", err);
    }
  }

  /* =========================================================
     PAYMENT FAILED
  ========================================================= */

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as any;

    try {
      const order = await prisma.order.findFirst({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      if (order && order.status !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "FAILED",
          },
        });

        console.log("❌ Order marked as FAILED:", order.id);
      }
    } catch (err) {
      console.error("🔥 Error processing failed webhook:", err);
    }
  }

  /* =========================================================
   REFUND CREATED
========================================================= */

  if (event.type === "refund.created") {
    const refund = event.data.object as any;

    try {

      const existingRefund = await prisma.refund.findUnique({
        where: { stripeRefundId: refund.id }
      });

      if (existingRefund) {
        console.log("⚠ Refund already exists, skipping:", refund.id);
        return res.json({ received: true });
      }

      const order = await prisma.order.findFirst({
        where: {
          stripePaymentIntentId: refund.payment_intent,
        },
      });

      if (!order) return res.json({ received: true });

      await prisma.refund.create({
        data: {
          orderId: order.id,
          stripeRefundId: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: "PENDING",
        },
      });

      await prisma.orderTransaction.create({
        data: {
          orderId: order.id,
          type: "REFUND",
          amount: refund.amount,
          currency: refund.currency,
          stripeRefundId: refund.id,
        },
      });

      console.log("💸 Refund created from webhook:", refund.id);

    } catch (err) {
      console.error("🔥 Error processing refund.created:", err);
    }
  }

  /* =========================================================
   REFUND UPDATED
========================================================= */

  if (event.type === "refund.updated") {
    const refund = event.data.object as any;

    try {
      const dbRefund = await prisma.refund.findUnique({
        where: { stripeRefundId: refund.id },
      });

      if (!dbRefund) return res.json({ received: true });

      const status =
        refund.status === "succeeded"
          ? "SUCCEEDED"
          : refund.status === "failed"
            ? "FAILED"
            : "PENDING";

      await prisma.refund.update({
        where: { stripeRefundId: refund.id },
        data: { status },
      });

      if (status === "SUCCEEDED") {

        const order = await prisma.order.findUnique({
          where: { id: dbRefund.orderId }
        })

        if (!order) return

        const refundAggregate = await prisma.refund.aggregate({
          where: {
            orderId: dbRefund.orderId,
            status: "SUCCEEDED"
          },
          _sum: {
            amount: true
          }
        })

        const totalRefunded = refundAggregate._sum.amount ?? 0

        const newStatus =
          totalRefunded >= order.totalAmount
            ? "REFUNDED"
            : "PARTIALLY_REFUNDED"

        await prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus }
        })

        console.log(`💰 Order refund processed: ${order.id} → ${newStatus}`)
      }

    } catch (err) {
      console.error("🔥 Error processing refund.updated:", err);
    }
  }

  return res.json({ received: true });
};