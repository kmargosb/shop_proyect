import { prisma } from "@/lib/prisma"
import { PaymentMethod } from "@prisma/client"
import { getProviderFromMethod } from "@/modules/payment/payment-method.mapper"
import { getPaymentProvider } from "@/modules/payment/payment.factory"

export const PaymentSessionService = {

  async createSession(orderId: string, method: PaymentMethod) {

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status === "PAID") {
      throw new Error("Order already paid")
    }

    const existingSession = await prisma.paymentSession.findFirst({
      where: {
        orderId,
        status: {
          in: ["PENDING", "ACTIVE"]
        }
      }
    })

    if (existingSession) {
      return existingSession
    }

    const provider = getProviderFromMethod(method)

    const session = await prisma.paymentSession.create({
      data: {
        orderId: order.id,
        provider,
        method,
        status: "PENDING"
      }
    })

    return session
  },

  async createPaymentIntent(sessionId: string) {

    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        order: true
      }
    })

    if (!session) {
      throw new Error("Payment session not found")
    }

    if (session.status === "COMPLETED") {
      throw new Error("Payment session already completed")
    }

    const provider = getPaymentProvider(session.provider)

    const paymentIntent = await provider.createPaymentIntent(
      session.order.totalAmount,
      session.order.currency,
      session.order.id
    )

    await prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        paymentIntentId: paymentIntent.id,
        status: "ACTIVE"
      }
    })

    await prisma.order.update({
      where: { id: session.order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentProvider: session.provider,
        paymentMethod: session.method,
        status: "PAYMENT_PROCESSING"
      }
    })

    return paymentIntent
  },

  async markSessionCompleted(paymentIntentId: string) {

    const session = await prisma.paymentSession.findFirst({
      where: {
        paymentIntentId
      }
    })

    if (!session) {
      return
    }

    await prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED"
      }
    })

  },

  async markSessionFailed(paymentIntentId: string) {

    const session = await prisma.paymentSession.findFirst({
      where: {
        paymentIntentId
      }
    })

    if (!session) {
      return
    }

    await prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: "FAILED"
      }
    })

  }

}