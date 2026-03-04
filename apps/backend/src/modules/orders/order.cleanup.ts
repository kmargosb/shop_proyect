import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function cleanupExpiredOrders() {
  const timeoutMinutes = 30;

  const expiryDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);
  
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PENDING, OrderStatus.PAYMENT_PROCESSING],
      },
      createdAt: {
        lt: expiryDate,
      },
    },
    include: {
      items: true,
    },
  });

  console.log("🧾 Orders found:", expiredOrders.length);

  for (const order of expiredOrders) {
    console.log("⏳ Expired order:", order.id);

    await prisma.$transaction(async (tx) => {
      // devolver stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // cancelar orden
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });
    });
  }

  if (expiredOrders.length > 0) {
    console.log(`🧹 Cleaned ${expiredOrders.length} expired orders`);
  }
}
