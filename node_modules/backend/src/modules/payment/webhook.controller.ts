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
      process.env.STRIPE_WEBHOOK_SECRET as string
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
        console.error(
          "⚠ Order not linked to PaymentIntent:",
          paymentIntent.id
        );
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

  return res.json({ received: true });
};