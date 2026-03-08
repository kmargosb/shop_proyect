import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/modules/email/sendOrderEmail";
import { PaymentSessionService } from "@/modules/payment-sessions/payment-session.service";

/* =========================================================
   UTIL
========================================================= */

async function findOrderFromPaymentIntent(paymentIntent: any) {
  let order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { invoice: true },
  });

  if (!order && paymentIntent.metadata?.orderId) {
    order = await prisma.order.findUnique({
      where: { id: paymentIntent.metadata.orderId },
      include: { invoice: true },
    });
  }

  return order;
}

/* =========================================================
   PAYMENT SUCCEEDED
========================================================= */

async function handlePaymentSucceeded(paymentIntent: any) {
  const order = await findOrderFromPaymentIntent(paymentIntent);

  if (!order) {
    console.error("⚠ Order not linked to PaymentIntent:", paymentIntent.id);
    return;
  }

  if (
    order.totalAmount !== paymentIntent.amount ||
    order.currency !== paymentIntent.currency
  ) {
    console.error("❌ Amount mismatch detected.");
    return;
  }

  if (order.status === "PAID") {
    const existingEvent = await prisma.orderEvent.findFirst({
      where: {
        orderId: order.id,
        type: "PAYMENT_SUCCEEDED",
      },
    });

    if (!existingEvent) {
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          type: "PAYMENT_SUCCEEDED",
          message: "Payment confirmed",
        },
      });
    }

    console.log("⚠ Duplicate webhook ignored.");
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  await prisma.orderTransaction.create({
    data: {
      orderId: order.id,
      type: "PAYMENT",
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "PAYMENT_SUCCEEDED",
      message: "Payment confirmed",
    },
  });

  await PaymentSessionService.markSessionCompleted(paymentIntent.id);

  console.log("✅ Order marked as PAID:", order.id);

  if (!order.invoice) {
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: `INV-${Date.now()}`,
        totalAmount: order.totalAmount,
        customerEmail: order.email,
      },
    });
  }

  await sendOrderConfirmationEmail(order.id);

  console.log("📧 Confirmation email sent.");
}

/* =========================================================
   PAYMENT FAILED
========================================================= */

async function handlePaymentFailed(paymentIntent: any) {
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (!order) return;

  if (order.status === "PAID") return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "FAILED" },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "PAYMENT_FAILED",
      message: "Payment failed",
    },
  });

  await PaymentSessionService.markSessionFailed(paymentIntent.id);

  console.log("❌ Order marked as FAILED:", order.id);
}

/* =========================================================
   REFUND CREATED
========================================================= */

async function handleRefundCreated(refund: any) {
  const existingRefund = await prisma.refund.findUnique({
    where: { stripeRefundId: refund.id },
  });

  if (existingRefund) {
    console.log("⚠ Refund already exists, skipping:", refund.id);
    return;
  }

  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: refund.payment_intent,
    },
  });

  if (!order) return;

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

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "REFUND_CREATED",
      message: "Refund created",
    },
  });

  console.log("💸 Refund created from webhook:", refund.id);
}

/* =========================================================
   REFUND UPDATED
========================================================= */

async function handleRefundUpdated(refund: any) {
  const dbRefund = await prisma.refund.findUnique({
    where: { stripeRefundId: refund.id },
  });

  if (!dbRefund) return;

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

  if (status !== "SUCCEEDED") return;

  const order = await prisma.order.findUnique({
    where: { id: dbRefund.orderId },
  });

  if (!order) return;

  /* =========================
     RESTORE STOCK
  ========================= */

  const refundItems = await prisma.refundItem.findMany({
    where: { refundId: dbRefund.id },
    include: { orderItem: true },
  });

  for (const item of refundItems) {
    await prisma.product.update({
      where: {
        id: item.orderItem.productId,
      },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  /* =========================
     CALCULATE TOTAL REFUND
  ========================= */

  const refundAggregate = await prisma.refund.aggregate({
    where: {
      orderId: dbRefund.orderId,
      status: "SUCCEEDED",
    },
    _sum: {
      amount: true,
    },
  });

  const totalRefunded = refundAggregate._sum.amount ?? 0;

  const newStatus =
    totalRefunded >= order.totalAmount
      ? "REFUNDED"
      : "PARTIALLY_REFUNDED";

  await prisma.order.update({
    where: { id: order.id },
    data: { status: newStatus },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: "REFUND_COMPLETED",
      message: "Refund completed",
    },
  });

  console.log(`💰 Order refund processed: ${order.id} → ${newStatus}`);
}

/* =========================================================
   MAIN WEBHOOK
========================================================= */

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

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "refund.created":
        await handleRefundCreated(event.data.object);
        break;

      case "refund.updated":
        await handleRefundUpdated(event.data.object);
        break;

      default:
        console.log("Unhandled webhook event:", event.type);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("🔥 Stripe webhook error:", err);
    return res.json({ received: true });
  }
};