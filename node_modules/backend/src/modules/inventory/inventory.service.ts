import { prisma } from "@/lib/prisma"

export const InventoryService = {

  async reserveStock(productId: string, orderId: string, quantity: number) {

    return prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error("Product not found")
      }

      const activeReservations = await tx.inventoryReservation.aggregate({
        where: {
          productId,
          expiresAt: {
            gt: new Date()
          }
        },
        _sum: {
          quantity: true
        }
      })

      const reserved = activeReservations._sum.quantity ?? 0

      const availableStock = product.stock - reserved

      if (availableStock < quantity) {
        throw new Error("Not enough stock available")
      }

      const reservation = await tx.inventoryReservation.create({
        data: {
          productId,
          orderId,
          quantity,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }
      })

      return reservation

    })
  },

  async confirmReservation(orderId: string) {

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId }
    })

    await prisma.$transaction(
      reservations.map((reservation) =>
        prisma.product.update({
          where: { id: reservation.productId },
          data: {
            stock: {
              decrement: reservation.quantity
            }
          }
        })
      )
    )

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