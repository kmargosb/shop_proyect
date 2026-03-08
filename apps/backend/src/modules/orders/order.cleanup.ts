import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { InventoryService } from "@/modules/inventory/inventory.service"

export async function cleanupExpiredOrders() {

  const timeoutMinutes = 15

  const expiryDate = new Date(Date.now() - timeoutMinutes * 60 * 1000)

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      createdAt: {
        lt: expiryDate
      }
    },
    include: {
      items: true
    }
  })

  console.log("🧾 Orders found:", expiredOrders.length)

  for (const order of expiredOrders) {

    console.log("⏳ Expired order:", order.id)

    await prisma.$transaction(async (tx) => {

      await InventoryService.releaseReservation(order.id)

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED
        }
      })

    })

  }

  if (expiredOrders.length > 0) {
    console.log(`🧹 Cleaned ${expiredOrders.length} expired orders`)
  }

}