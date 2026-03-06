import { prisma } from "@/lib/prisma"
import { RefundReason } from "@prisma/client"

export const RefundRepository = {

  create(data: {
    orderId: string
    stripeRefundId?: string
    amount: number
    currency: string
    reason?: RefundReason
  }) {
    return prisma.refund.create({ data })
  },

  updateStatus(id: string, status: "SUCCEEDED" | "FAILED", stripeRefundId?: string) {
    return prisma.refund.update({
      where: { id },
      data: {
        status,
        stripeRefundId
      }
    })
  },

  findByStripeRefundId(stripeRefundId: string) {
    return prisma.refund.findUnique({
      where: { stripeRefundId }
    })
  },

  findByOrderId(orderId: string) {
  return prisma.refund.findMany({
    where: { orderId },
    include: { items: true }
  })
}

}