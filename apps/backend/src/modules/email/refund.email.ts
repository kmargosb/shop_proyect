import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email.service";

import {
  refundApprovedTemplate,
  refundRejectedTemplate,
  refundCompletedTemplate,
} from "./email.templates";

export async function sendRefundApprovedEmail(
  orderId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return;

  const orderUrl =
    `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  await sendEmail({
    to: order.email,
    subject: "Return Request Approved",
    html: refundApprovedTemplate(
      order.fullName,
      orderUrl,
    ),
  });
}

export async function sendRefundRejectedEmail(
  orderId: string,
  reason: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return;

  const orderUrl =
    `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  await sendEmail({
    to: order.email,
    subject: "Solicitud de devolución rechazada",
    html: refundRejectedTemplate(
      order.fullName,
      reason,
      orderUrl,
    ),
  });
}

export async function sendRefundCompletedEmail(
  orderId: string,
  amount: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return;

  const orderUrl =
    `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  await sendEmail({
    to: order.email,
    subject: "Refund Processed",
    html: refundCompletedTemplate(
      order.fullName,
      amount,
      orderUrl,
    ),
  });
}
