import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { RefundRepository } from "./refund.repository";
import { RefundReason } from "@prisma/client";
import { getIO } from "@/lib/socket";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const RefundService = {
  async createRefund(
    orderId: string,
    items: { orderItemId: string; quantity: number }[],
    reason?: RefundReason,
    note?: string,
    evidence: { url: string; publicId?: string }[] = [],
  ) {
    /* =========================
       PROTECCIÓN 1
       Validar items antes de todo
    ========================= */

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Refund items are required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        refunds: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.stripePaymentIntentId) {
      throw new Error("Order has no payment intent");
    }

    if (order.status === "REFUNDED") {
      throw new Error("Order already fully refunded");
    }

    let refundAmount = 0;

    for (const item of items) {
      const orderItem = order.items.find((i) => i.id === item.orderItemId);

      if (!orderItem) {
        throw new Error("Order item not found");
      }

      const refundedQuantity = order.refunds
        .filter((r) => r.status === "SUCCEEDED")
        .flatMap((r) => r.items)
        .filter((ri) => ri.orderItemId === item.orderItemId)
        .reduce((sum, ri) => sum + ri.quantity, 0);

      const remainingQuantity = orderItem.quantity - refundedQuantity;

      if (remainingQuantity <= 0) {
        throw new Error("Item already fully refunded");
      }

      if (item.quantity > remainingQuantity) {
        throw new Error("Refund quantity exceeds purchased quantity");
      }

      refundAmount += orderItem.price * item.quantity;
    }

    /* =========================
       PROTECCIÓN 2
    ========================= */

    if (refundAmount <= 0) {
      throw new Error("Invalid refund amount");
    }

    /* =========================
       PROTECCIÓN 3
    ========================= */

    const refundAggregate = await prisma.refund.aggregate({
      where: {
        orderId: orderId,
        status: "SUCCEEDED",
      },
      _sum: {
        amount: true,
      },
    });

    const alreadyRefunded = refundAggregate._sum.amount ?? 0;

    if (alreadyRefunded + refundAmount > order.totalAmount) {
      throw new Error("Refund exceeds order total");
    }

    //console.log("💰 REFUND AMOUNT:", refundAmount);
    //console.log("💳 PAYMENT INTENT:", order.stripePaymentIntentId);

    /* =========================
       DB REFUND
    ========================= */

    const dbRefund = await RefundRepository.create({
      orderId,

      amount: refundAmount,

      currency: order.currency,

      reason,
      note,
    });


    await prisma.orderEvent.create({
      data: {
        orderId,
        type: "REFUND_CREATED",
        message: "Refund created",
      },
    });
    const io = getIO();

    console.log("📡 emitting refund update", orderId);

    io.emit("orderUpdated", {
      orderId,
    });

    /* =========================
       REFUND ITEMS
    ========================= */

    for (const item of items) {
      const orderItem = order.items.find((i) => i.id === item.orderItemId);

      if (!orderItem) continue;

      await prisma.refundItem.create({
        data: {
          refundId: dbRefund.id,
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          amount: orderItem.price * item.quantity,
        },
      });
    }


    if (evidence.length > 0) {
      await prisma.refundEvidence.createMany({
        data: evidence.map((item) => ({
          refundId: dbRefund.id,
          url: item.url,
          publicId: item.publicId ?? null,
        })),
      });
    }
    return {
      refundId: dbRefund.id,
      amount: dbRefund.amount,
      status: dbRefund.status,
    };
  },

  async approveRefund(refundId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: true,
        items: {
          include: {
            orderItem: true,
          },
        },
      },
    });

    if (!refund) {
      throw new Error("Refund not found");
    }

    if (refund.status !== "PENDING_REVIEW") {
      throw new Error("Refund already processed");
    }

    if (!refund.order.stripePaymentIntentId) {
      throw new Error("Order has no payment intent");
    }

    const stripeRefund = await stripe.refunds.create({
      payment_intent: refund.order.stripePaymentIntentId,

      amount: refund.amount,

      reason: "requested_by_customer",
    });

    const updatedRefund = await prisma.refund.update({
      where: {
        id: refundId,
      },

      data: {
        status: "SUCCEEDED",

        stripeRefundId: stripeRefund.id,

        reviewedAt: new Date(),
      },
    });

    if (refund.items.length > 0) {
      await prisma.$transaction(
        refund.items.map((item) =>
          prisma.product.update({
            where: { id: item.orderItem.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
    }

    await prisma.orderEvent.create({
      data: {
        orderId: refund.orderId,

        type: "REFUND_COMPLETED",

        message: "Refund completed",
      },
    });

    getIO().emit("orderUpdated", {
      orderId: refund.orderId,
    });

    return updatedRefund;
  },
  async rejectRefund(refundId: string, rejectionReason?: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "PENDING_REVIEW") {
    throw new Error("Refund already processed");
  }

  const updatedRefund = await prisma.refund.update({
    where: {
      id: refundId,
    },

    data: {
      status: "REJECTED",

      rejectionReason,

      reviewedAt: new Date(),
    },
  });

  getIO().emit("orderUpdated", {
    orderId: refund.orderId,
  });

  return updatedRefund;
},
};
