import { prisma } from "@/lib/prisma";

const RESERVATION_TIME_MINUTES = 15;

export const InventoryService = {
  /* =========================================================
     RESERVE STOCK (RACE CONDITION SAFE)
  ========================================================= */

  async reserveStock(
    tx: any,
    productId: string,
    orderId: string,
    quantity: number,
  ) {
    /* lock product row */

    const rows: any[] = await tx.$queryRaw`
      SELECT id, stock, "reservedStock"
      FROM "Product"
      WHERE id = ${productId}
      FOR UPDATE
    `;

    const product = rows[0];

    if (!product) {
      throw new Error("Product not found");
    }

    const aggregate = await tx.inventoryReservation.aggregate({
      where: {
        productId,
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const reserved = aggregate._sum.quantity ?? 0;

    const availableStock = product.stock - reserved;

    if (availableStock < quantity) {
      throw new Error("Not enough stock available");
    }

    /* create reservation */

    await tx.inventoryReservation.create({
      data: {
        productId,
        orderId,
        quantity,
        expiresAt: new Date(Date.now() + RESERVATION_TIME_MINUTES * 60 * 1000),
      },
    });

    /* update reserved stock */

    await tx.product.update({
      where: { id: productId },
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
        product: {
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
          productId: reservation.productId,
          expiresAt: {
            gt: now,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const reserved = aggregate._sum.quantity ?? 0;

      if (reserved > reservation.product.stock) {
        throw new Error(
          `Stock mismatch detected for product ${reservation.productId}`,
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
        const product = await tx.product.findUnique({
          where: { id: reservation.productId },
          select: { reservedStock: true },
        });

        if (!product || product.reservedStock < reservation.quantity) {
          throw new Error("Inventory inconsistency detected");
        }

        await tx.product.update({
          where: { id: reservation.productId },
          data: {
            stock: {
              decrement: reservation.quantity,
            },
            reservedStock: {
              decrement: reservation.quantity,
            },
          },
        });

        /* sync redis stock cache */

        try {
          await InventoryCache.decrementStock(
            reservation.productId,
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
        const product = await tx.product.findUnique({
          where: { id: reservation.productId },
          select: { reservedStock: true },
        });

        if (!product) continue;

        const decrement = Math.min(reservation.quantity, product.reservedStock);

        await tx.product.update({
          where: { id: reservation.productId },
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

  async repairReservedStock(productId: string) {
    const aggregate = await prisma.inventoryReservation.aggregate({
      where: {
        productId,
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const realReserved = aggregate._sum.quantity ?? 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        reservedStock: realReserved,
      },
    });
  },

  /* =========================================================
     INVENTORY CONSISTENCY GUARD (ALL PRODUCTS)
  ========================================================= */

  async repairAllReservedStock() {
    const products = await prisma.product.findMany({
      select: { id: true },
    });

    for (const product of products) {
      const aggregate = await prisma.inventoryReservation.aggregate({
        where: {
          productId: product.id,
          expiresAt: {
            gt: new Date(),
          },
        },
        _sum: {
          quantity: true,
        },
      });

      const realReserved = aggregate._sum.quantity ?? 0;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          reservedStock: realReserved,
        },
      });
    }

    console.log("🔧 Inventory consistency repaired");
  },
};
