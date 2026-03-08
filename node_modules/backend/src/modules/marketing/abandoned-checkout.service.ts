import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { sendEmail } from "@/modules/email/email.service"

export const AbandonedCheckoutService = {

  async processAbandonedOrders() {

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING
      }
    })

    const now = Date.now()

    for (const order of orders) {

      const ageMinutes =
        (now - order.createdAt.getTime()) / (1000 * 60)

      /* =============================
         EMAIL 1 → 1 hour
      ============================= */

      if (ageMinutes > 60 && order.abandonedEmailStage === 0) {

        await sendEmail({
          to: order.email,
          subject: "You forgot something in your cart 🛒",
          html: `
            <h2>Hello ${order.fullName}</h2>
            <p>You left items in your cart.</p>
            <p>Complete your purchase before they sell out.</p>
          `
        })

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 1
          }
        })

      }

      /* =============================
         EMAIL 2 → 24 hours
      ============================= */

      if (ageMinutes > 1440 && order.abandonedEmailStage === 1) {

        await sendEmail({
          to: order.email,
          subject: "Your cart is still waiting 🛍",
          html: `
            <h2>Hello ${order.fullName}</h2>
            <p>Your items are still in your cart.</p>
            <p>Checkout before they run out!</p>
          `
        })

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 2
          }
        })

      }

      /* =============================
         EMAIL 3 → 48 hours
      ============================= */

      if (ageMinutes > 2880 && order.abandonedEmailStage === 2) {

        await sendEmail({
          to: order.email,
          subject: "Last chance to complete your order",
          html: `
            <h2>Hello ${order.fullName}</h2>
            <p>Your cart is about to expire.</p>
            <p>Complete your order now!</p>
          `
        })

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 3
          }
        })

      }

    }

  }

}