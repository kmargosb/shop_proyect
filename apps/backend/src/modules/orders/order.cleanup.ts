import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { InventoryService } from "@/modules/inventory/inventory.service";
import { stripe } from "@/lib/stripe";
import { getIO } from "@/lib/socket";

export async function cleanupExpiredOrders() {
  /* ===============================
     TIME WINDOWS
  =============================== */

  const now = Date.now();

  const pendingLimit = new Date(now - 20 * 60 * 1000);
  const processingLimit = new Date(now - 20 * 60 * 1000);

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

    /* =========================
       CANCEL STRIPE INTENT
    ========================= */

    if (order.stripePaymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(order.stripePaymentIntentId);

        console.log("🚫 PaymentIntent cancelled:", order.stripePaymentIntentId);
      } catch (error) {
        console.error("❌ Failed to cancel PaymentIntent:", error);
      }
    }

    /* =========================
       DB TRANSACTION
    ========================= */

    await prisma.$transaction(async (tx) => {
      await InventoryService.releaseReservation(order.id);

      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: "ORDER_CANCELLED",
          message: "Order expired (auto cleanup)",
        },
      });
    });

    /* =========================
       REALTIME EVENT
    ========================= */

    getIO().emit("orderCancelled", {
      orderId: order.id,
    });
  }

  /* ===============================
     LOG FINAL
  =============================== */

  if (expiredOrders.length > 0) {
    console.log(`🧹 Cleaned ${expiredOrders.length} expired orders`);
  }
}
