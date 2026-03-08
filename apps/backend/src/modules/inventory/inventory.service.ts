import { prisma } from "@/lib/prisma"

const RESERVATION_TIME_MINUTES = 15

export const InventoryService = {

  /* =========================================================
     RESERVE STOCK
  ========================================================= */

  async reserveStock(productId: string, orderId: string, quantity: number) {

    return prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error("Product not found")
      }

      /* =========================
         CALCULATE RESERVED STOCK
      ========================= */

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

      /* =========================
         CREATE RESERVATION
      ========================= */

      const reservation = await tx.inventoryReservation.create({
        data: {
          productId,
          orderId,
          quantity,
          expiresAt: new Date(
            Date.now() + RESERVATION_TIME_MINUTES * 60 * 1000
          )
        }
      })

      return reservation
    })
  },

  /* =========================================================
     VALIDATE RESERVATION BEFORE PAYMENT
  ========================================================= */

  async validateReservation(orderId: string) {

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId },
      include: {
        product: true
      }
    })

    for (const reservation of reservations) {

      const activeReservations = await prisma.inventoryReservation.aggregate({
        where: {
          productId: reservation.productId,
          expiresAt: {
            gt: new Date()
          }
        },
        _sum: {
          quantity: true
        }
      })

      const reserved = activeReservations._sum.quantity ?? 0

      const availableStock = reservation.product.stock - reserved

      if (availableStock < reservation.quantity) {
        throw new Error(
          `Stock mismatch detected for product ${reservation.productId}`
        )
      }
    }
  },

  /* =========================================================
     CONFIRM RESERVATION (PAYMENT SUCCESS)
  ========================================================= */

  async confirmReservation(orderId: string) {

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId }
    })

    if (reservations.length === 0) {
      return
    }

    await prisma.$transaction(async (tx) => {

      for (const reservation of reservations) {

        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            stock: {
              decrement: reservation.quantity
            }
          }
        })
      }

      await tx.inventoryReservation.deleteMany({
        where: { orderId }
      })

    })
  },

  /* =========================================================
     RELEASE RESERVATION (ORDER CANCELLED / EXPIRED)
  ========================================================= */

  async releaseReservation(orderId: string) {

    await prisma.inventoryReservation.deleteMany({
      where: { orderId }
    })

  }

}