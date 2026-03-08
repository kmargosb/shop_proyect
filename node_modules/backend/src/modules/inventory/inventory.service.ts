import { prisma } from "@/lib/prisma"

const RESERVATION_TIME_MINUTES = 15

export const InventoryService = {

  /* =========================================================
     RESERVE STOCK
  ========================================================= */

  async reserveStock(productId: string, orderId: string, quantity: number) {

    return prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          stock: true,
          reservedStock: true
        }
      })

      if (!product) {
        throw new Error("Product not found")
      }

      const availableStock = product.stock - product.reservedStock

      if (availableStock < quantity) {
        throw new Error("Not enough stock available")
      }

      await tx.inventoryReservation.create({
        data: {
          productId,
          orderId,
          quantity,
          expiresAt: new Date(
            Date.now() + RESERVATION_TIME_MINUTES * 60 * 1000
          )
        }
      })

      await tx.product.update({
        where: { id: productId },
        data: {
          reservedStock: {
            increment: quantity
          }
        }
      })

    })

  },

  /* =========================================================
     VALIDATE RESERVATION BEFORE PAYMENT
  ========================================================= */

  async validateReservation(orderId: string) {

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId },
      include: {
        product: {
          select: {
            id: true,
            stock: true
          }
        }
      }
    })

    if (reservations.length === 0) {
      return
    }

    const now = new Date()

    for (const reservation of reservations) {

      const reservationAggregate = await prisma.inventoryReservation.aggregate({
        where: {
          productId: reservation.productId,
          expiresAt: {
            gt: now
          }
        },
        _sum: {
          quantity: true
        }
      })

      const reserved = reservationAggregate._sum.quantity ?? 0
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

    if (reservations.length === 0) return

    await prisma.$transaction(async (tx) => {

      for (const reservation of reservations) {

        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            stock: {
              decrement: reservation.quantity
            },
            reservedStock: {
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

    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId }
    })

    if (reservations.length === 0) return

    await prisma.$transaction(async (tx) => {

      for (const reservation of reservations) {

        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            reservedStock: {
              decrement: reservation.quantity
            }
          }
        })

      }

      await tx.inventoryReservation.deleteMany({
        where: { orderId }
      })

    })

  }

}