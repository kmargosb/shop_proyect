import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { sendEmail } from "@/modules/email/email.service";
import {
  abandonedCheckoutEmail1Template,
  abandonedCheckoutEmail2Template,
  abandonedCheckoutEmail3Template,
} from "@/modules/email/email.templates";

export const AbandonedCheckoutService = {
  async processAbandonedOrders() {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.PAYMENT_PROCESSING,
            OrderStatus.CANCELLED,
          ],
        },
      },
    });

    const now = Date.now();

    for (const order of orders) {
      const ageMinutes = (now - order.createdAt.getTime()) / (1000 * 60);

      /* =============================
         EMAIL 1 → 10 min
      ============================= */

      if (
        ageMinutes > 10 &&
        order.abandonedEmailStage === 0 &&
        (order.status === OrderStatus.PENDING ||
          order.status === OrderStatus.PAYMENT_PROCESSING)
      ) {
        const orderUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;
        await sendEmail({
          to: order.email,
          subject: "You forgot something in your cart 🛒",
          html: abandonedCheckoutEmail1Template(order.fullName, orderUrl),
        });

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 1,
          },
        });
      }

      /* =============================
         EMAIL 2 → 24 hours
      ============================= */

      if (
        ageMinutes > 1440 &&
        order.abandonedEmailStage === 1 &&
        order.status === OrderStatus.CANCELLED
      ) {
        const orderUrl = `${process.env.FRONTEND_URL}/shop`;
        await sendEmail({
          to: order.email,
          subject: "Still Thinking About It?",
          html: abandonedCheckoutEmail2Template(order.fullName, orderUrl),
        });

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 2,
          },
        });
      }

      /* =============================
         EMAIL 3 → 48 hours
      ============================= */

      if (
        ageMinutes > 2880 &&
        order.abandonedEmailStage === 2 &&
        order.status === OrderStatus.CANCELLED
      ) {
        const orderUrl = `${process.env.FRONTEND_URL}/shop`;
        await sendEmail({
          to: order.email,
          subject: "Last Chance To Discover Something Special",
          html: abandonedCheckoutEmail3Template(order.fullName, orderUrl),
        });

        await prisma.order.update({
          where: { id: order.id },
          data: {
            abandonedEmailStage: 3,
          },
        });
      }
    }
  },
};
