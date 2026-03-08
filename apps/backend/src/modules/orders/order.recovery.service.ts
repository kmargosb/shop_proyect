import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/modules/email/sendOrderEmail"

export async function sendAbandonedCheckoutEmails() {

  const abandonedTime = new Date(Date.now() - 30 * 60 * 1000)

  const abandonedOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: abandonedTime
      }
    }
  })

  for (const order of abandonedOrders) {

    console.log("📩 Sending abandoned checkout email:", order.email)

    await sendOrderConfirmationEmail(order.id)

  }

}