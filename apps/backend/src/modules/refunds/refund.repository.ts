import {prisma} from "@/lib/prisma"

export const RefundRepository = {

  create(data: {
    orderId: string
    stripeRefundId?: string
    amount: number
    currency: string
    reason?: string
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
  }

}