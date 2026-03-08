import { prisma } from "@/lib/prisma"

export const InventoryService = {

  async reserveStock(productId: string, orderId: string, quantity: number) {

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error("Product not found")
    }

    if (product.stock < quantity) {
      throw new Error("Not enough stock")
    }

    const reservation = await prisma.inventoryReservation.create({
      data: {
        productId,
        orderId,
        quantity,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })

    return reservation
  },

  async confirmReservation(orderId: string) {

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId }
    })

    for (const reservation of reservations) {

      await prisma.product.update({
        where: { id: reservation.productId },
        data: {
          stock: {
            decrement: reservation.quantity
          }
        }
      })

    }

    await prisma.inventoryReservation.deleteMany({
      where: { orderId }
    })
  },

  async releaseReservation(orderId: string) {

    await prisma.inventoryReservation.deleteMany({
      where: { orderId }
    })

  }

}