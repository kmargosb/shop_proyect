import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { InventoryService } from "@/modules/inventory/inventory.service";

export async function cleanupExpiredOrders() {
  /* ===============================
     TIME WINDOWS (PRO)
  =============================== */

  const now = Date.now();

  const pendingLimit = new Date(now - 15 * 60 * 1000); // 15 min
  const processingLimit = new Date(now - 30 * 60 * 1000); // 30 min

  /* ===============================
     FIND EXPIRED ORDERS
  =============================== */

  const expiredOrders = await prisma.order.findMany({
    where: {
      OR: [
        {
          status: OrderStatus.PENDING,
          createdAt: {
            lt: pendingLimit,
          },
        },
        {
          status: OrderStatus.PAYMENT_PROCESSING,
          createdAt: {
            lt: processingLimit,
          },
        },
      ],
    },
    include: {
      items: true,
    },
  });

  console.log("🧾 Orders found:", expiredOrders.length);

  /* ===============================
     PROCESS EACH ORDER
  =============================== */

  for (const order of expiredOrders) {
    console.log("⏳ Expired order:", order.id, order.status);

    await prisma.$transaction(async (tx) => {
      /* =========================
         RELEASE INVENTORY
      ========================= */

      await InventoryService.releaseReservation(order.id);

      /* =========================
         UPDATE STATUS
      ========================= */

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      /* =========================
         TIMELINE EVENT (PRO)
      ========================= */

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: "ORDER_CANCELLED",
          message: "Order expired (auto cleanup)",
        },
      });
    });
  }

  /* ===============================
     LOG FINAL
  =============================== */

  if (expiredOrders.length > 0) {
    console.log(`🧹 Cleaned ${expiredOrders.length} expired orders`);
  }
}