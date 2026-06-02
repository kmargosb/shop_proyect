import { prisma } from "@/lib/prisma";

const RESERVATION_TIME_MINUTES = 1;

export const InventoryService = {
  /* =========================================================
     RESERVE STOCK (RACE CONDITION SAFE)
  ========================================================= */

  async reserveStock(
    tx: any,
    variantId: string,
    orderId: string,
    quantity: number,
  ) {
    const variant = await tx.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

    if (!variant) {
      throw new Error("Variant not found");
    }

    const availableStock = variant.stock - variant.reservedStock;

    if (availableStock < quantity) {
      throw new Error("Not enough stock available");
    }

    await tx.inventoryReservation.create({
      data: {
        variantId,
        orderId,
        quantity,
        expiresAt: new Date(Date.now() + RESERVATION_TIME_MINUTES * 60 * 1000),
      },
    });

    await tx.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });
  },

  /* =========================================================
     VALIDATE RESERVATION BEFORE PAYMENT
  ========================================================= */

  async validateReservation(orderId: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId },

      include: {
        variant: {
          select: {
            id: true,
            stock: true,
          },
        },
      },
    });

    if (reservations.length === 0) return;

    const now = new Date();

    for (const reservation of reservations) {
      const aggregate = await prisma.inventoryReservation.aggregate({
        where: {
          variantId: reservation.variantId,

          expiresAt: {
            gt: now,
          },
        },

        _sum: {
          quantity: true,
        },
      });

      const reserved = aggregate._sum.quantity ?? 0;

      if (reserved > reservation.variant.stock) {
        throw new Error(
          `Stock mismatch detected for variant ${reservation.variantId}`,
        );
      }
    }
  },

  /* =========================================================
     CONFIRM RESERVATION (PAYMENT SUCCESS)
  ========================================================= */

  async confirmReservation(orderId: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId },
    });

    if (reservations.length === 0) return;

    const { InventoryCache } =
      await import("@/modules/inventory/inventory.cache");

    await prisma.$transaction(async (tx) => {
      for (const reservation of reservations) {
        const variant = await tx.productVariant.findUnique({
          where: {
            id: reservation.variantId,
          },

          select: {
            stock: true,
            reservedStock: true,
          },
        });

        if (!variant || variant.reservedStock < reservation.quantity) {
          throw new Error("Inventory inconsistency detected");
        }

        await tx.productVariant.update({
          where: {
            id: reservation.variantId,
          },

          data: {
            stock: {
              decrement: reservation.quantity,
            },

            reservedStock: {
              decrement: reservation.quantity,
            },
          },
        });

        try {
          await InventoryCache.decrementStock(
            reservation.variantId,
            reservation.quantity,
          );
        } catch (error) {
          console.error("Redis stock sync error:", error);
        }
      }

      await tx.inventoryReservation.deleteMany({
        where: { orderId },
      });
    });
  },

  /* =========================================================
     RELEASE RESERVATION (ORDER CANCELLED / EXPIRED)
  ========================================================= */

  async releaseReservation(orderId: string) {
    const reservations = await prisma.inventoryReservation.findMany({
      where: { orderId },
    });

    if (reservations.length === 0) return;

    await prisma.$transaction(async (tx) => {
      for (const reservation of reservations) {
        const variant = await tx.productVariant.findUnique({
          where: {
            id: reservation.variantId,
          },

          select: {
            reservedStock: true,
          },
        });

        if (!variant) continue;

        const decrement = Math.min(reservation.quantity, variant.reservedStock);

        await tx.productVariant.update({
          where: {
            id: reservation.variantId,
          },

          data: {
            reservedStock: {
              decrement,
            },
          },
        });
      }

      await tx.inventoryReservation.deleteMany({
        where: { orderId },
      });
    });
  },

  /* =========================================================
     INVENTORY CONSISTENCY GUARD (REPAIR SINGLE PRODUCT)
  ========================================================= */

  async repairReservedStock(variantId: string) {
    const aggregate = await prisma.inventoryReservation.aggregate({
      where: {
        variantId,

        expiresAt: {
          gt: new Date(),
        },
      },

      _sum: {
        quantity: true,
      },
    });

    const realReserved = aggregate._sum.quantity ?? 0;

    await prisma.productVariant.update({
      where: {
        id: variantId,
      },

      data: {
        reservedStock: realReserved,
      },
    });
  },

  /* =========================================================
     INVENTORY CONSISTENCY GUARD (ALL PRODUCTS)
  ========================================================= */

  async repairAllReservedStock() {
    const variants = await prisma.productVariant.findMany({
      select: {
        id: true,
      },
    });

    for (const variant of variants) {
      const aggregate = await prisma.inventoryReservation.aggregate({
        where: {
          variantId: variant.id,

          expiresAt: {
            gt: new Date(),
          },
        },

        _sum: {
          quantity: true,
        },
      });

      const realReserved = aggregate._sum.quantity ?? 0;

      await prisma.productVariant.update({
        where: {
          id: variant.id,
        },

        data: {
          reservedStock: realReserved,
        },
      });
    }

    console.log("🔧 Inventory consistency repaired");
  },
};
