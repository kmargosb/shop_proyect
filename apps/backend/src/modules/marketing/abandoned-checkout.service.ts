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
          in: [OrderStatus.PENDING, OrderStatus.PAYMENT_PROCESSING],
        },
      },
    });

    const now = Date.now();

    for (const order of orders) {
      const ageMinutes = (now - order.createdAt.getTime()) / (1000 * 60);

      console.log(
  "📧 CHECK",
  order.id,
  order.status,
  "stage:",
  order.abandonedEmailStage,
  "age:",
  ageMinutes,
);

      /* =============================
         EMAIL 1 → 1 hour
      ============================= */

      if (ageMinutes > 10 && order.abandonedEmailStage === 0) {
       
    console.log("🚀 EMAIL 1 TRIGGERED", order.id);
       
        const orderUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;
        await sendEmail({
          to: order.email,
          subject: "You forgot something in your cart 🛒",
          html: abandonedCheckoutEmail1Template(order.fullName, orderUrl),
        });

    console.log("✅ EMAIL 1 SENT", order.id);

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

      if (ageMinutes > 1440 && order.abandonedEmailStage === 1) {
        const orderUrl =`${process.env.FRONTEND_URL}/orders/${order.id}/pay`;
        await sendEmail({
          to: order.email,
          subject: "Your cart is still waiting 🛍",
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

      if (ageMinutes > 2880 && order.abandonedEmailStage === 2) {
        const orderUrl =`${process.env.FRONTEND_URL}/orders/${order.id}/pay`;
        await sendEmail({
          to: order.email,
          subject: "Last chance to complete your order",
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
