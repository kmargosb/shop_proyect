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
    subject: "Tu devolución ha sido aprobada",
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
    subject: "Reembolso procesado",
    html: refundCompletedTemplate(
      order.fullName,
      amount,
      orderUrl,
    ),
  });
}

export async function sendRefundCreatedAdminEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  reason: string,
) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: `Nueva devolución - Pedido #${orderId.slice(0, 8)}`,
    html: `
      <div style="font-family:Arial;padding:24px">
        <h1>Nueva solicitud de devolución</h1>

        <p>
          <strong>Pedido:</strong>
          #${orderId.slice(0, 8)}
        </p>

        <p>
          <strong>Cliente:</strong>
          ${customerName}
        </p>

        <p>
          <strong>Email:</strong>
          ${customerEmail}
        </p>

        <p>
          <strong>Motivo:</strong>
          ${reason}
        </p>
      </div>
    `,
  });
}