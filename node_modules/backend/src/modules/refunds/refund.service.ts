import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { RefundRepository } from "./refund.repository"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover"
})

export const RefundService = {

  async createRefund(
    orderId: string,
    items: { orderItemId: string; quantity: number }[],
    reason?: string
  ) {

    /* =========================
       PROTECCIÓN 1
       Validar items antes de todo
    ========================= */

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Refund items are required")
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        refunds: {
          include: {
            items: true
          }
        }
      }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (!order.stripePaymentIntentId) {
      throw new Error("Order has no payment intent")
    }

    if (order.status === "REFUNDED") {
      throw new Error("Order already fully refunded")
    }

    let refundAmount = 0

    for (const item of items) {

      const orderItem = order.items.find(i => i.id === item.orderItemId)

      if (!orderItem) {
        throw new Error("Order item not found")
      }

      const refundedQuantity = order.refunds
        .flatMap(r => r.items)
        .filter(ri => ri.orderItemId === item.orderItemId)
        .reduce((sum, ri) => sum + ri.quantity, 0)

      const remainingQuantity = orderItem.quantity - refundedQuantity

      if (remainingQuantity <= 0) {
        throw new Error("Item already fully refunded")
      }

      if (item.quantity > remainingQuantity) {
        throw new Error("Refund quantity exceeds purchased quantity")
      }

      refundAmount += orderItem.price * item.quantity
    }

    /* =========================
       PROTECCIÓN 2
       Evitar refund de 0 o negativo
    ========================= */

    if (refundAmount <= 0) {
      throw new Error("Invalid refund amount")
    }

    /* =========================
       PROTECCIÓN 3
       Evitar devolver más que el total
    ========================= */

    const refundAggregate = await prisma.refund.aggregate({
      where: {
        orderId: orderId,
        status: "SUCCEEDED"
      },
      _sum: {
        amount: true
      }
    })

    const alreadyRefunded = refundAggregate._sum.amount ?? 0

    if (alreadyRefunded + refundAmount > order.totalAmount) {
      throw new Error("Refund exceeds order total")
    }

    const stripeRefund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: refundAmount,
      reason: reason as any
    })

    const dbRefund = await RefundRepository.create({
      orderId,
      stripeRefundId: stripeRefund.id,
      amount: refundAmount,
      currency: stripeRefund.currency,
      reason
    })

    await prisma.orderEvent.create({
      data: {
        orderId,
        type: "REFUND_CREATED",
        message: "Refund created",
      },
    });

    for (const item of items) {

      const orderItem = order.items.find(i => i.id === item.orderItemId)

      if (!orderItem) continue

      await prisma.refundItem.create({
        data: {
          refundId: dbRefund.id,
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          amount: orderItem.price * item.quantity
        }
      })
    }

    return {
      stripeRefund,
      dbRefund
    }

  }

}