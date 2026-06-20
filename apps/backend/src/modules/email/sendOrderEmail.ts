import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email.service";
import {
  orderConfirmationTemplate,
  shipmentConfirmationTemplate,
  helpRequestTemplate,
  customerReplyTemplate,
} from "./email.templates";

import { generateInvoicePDF } from "@/modules/invoices/invoice.generator";

export async function sendOrderConfirmationEmail(orderId: string) {
  console.log("📧 Order confirmation email triggered");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      invoice: true,
    },
  });

  if (!order) {
    console.warn("⚠ Order not found:", orderId);
    return;
  }

  if (!order.invoice) {
    console.warn("⚠ Invoice missing for order:", orderId);
    return;
  }

  console.log("📧 Sending email to:", order.email);

  /* =========================
     GENERATE INVOICE PDF
  ========================= */

  const pdfBuffer = await generateInvoicePDF(order.invoice.id);

  /* =========================
     PUBLIC ORDER LINK
  ========================= */

  const publicUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  /* =========================
     EMAIL HTML
  ========================= */

  const html = orderConfirmationTemplate(order.fullName, order.id, publicUrl);

  /* =========================
     SEND EMAIL
  ========================= */

  await sendEmail({
    to: order.email,
    subject: "Order Confirmed",
    html,
    attachments: [
      {
        filename: `invoice-${order.invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  console.log("✅ Order confirmation email sent");
}

export async function sendShipmentEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },

    include: {
      shipment: true,
    },
  });

  if (!order || !order.shipment) {
    return;
  }

  const publicUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  const html = shipmentConfirmationTemplate(
    order.fullName,
    order.id,
    order.shipment.carrier,
    order.shipment.trackingNumber,
    publicUrl,
  );

  await sendEmail({
    to: order.email,

    subject: "Your Order Has Shipped",

    html,
  });

  console.log("✅ Shipment email sent");
}

export async function sendHelpRequestEmail(
  orderId: string,
  message: string,
  contactPhone?: string,
) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const html = helpRequestTemplate(
    order.id,
    order.fullName,
    order.email,
    order.phone,
    contactPhone || null,
    message,
  );

  await sendEmail({
    to: process.env.SUPPORT_EMAIL as string,
    subject: `New Support Request • Order #${order.id.slice(0, 8)}`,
    html,
  });

  console.log("✅ Help request email sent");
}

export async function sendCustomerReplyEmail(
  orderId: string,
  message: string,
  includeCancelLink?: boolean,
) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const cancelUrl = includeCancelLink
    ? `${process.env.FRONTEND_URL}/orders/${order.id}/cancel?email=${order.email}`
    : undefined;

  const html = customerReplyTemplate(order.fullName, message, cancelUrl);

  await sendEmail({
    to: order.email,

    subject: `Message About Your Order #${order.id.slice(0, 8)}`,

    html,
  });
}

export async function sendRefundRequestEmail(orderId: string, reason: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await sendEmail({
    to: process.env.SUPPORT_EMAIL as string,

    subject: `Refund request #${order.id.slice(0, 8)}`,

    html: `
  <div style="font-family:Arial,sans-serif;padding:24px">
    <h2>New Return Request</h2>

    <p>
      <strong>Order:</strong>
      ${order.id}
    </p>

    <p>
      <strong>Customer:</strong>
      ${order.fullName}
    </p>

    <p>
      <strong>Email:</strong>
      ${order.email}
    </p>

    <p>
      <strong>Reason:</strong>
      ${reason}
    </p>

    <a href="${process.env.ADMIN_PANEL_URL}/orders/${order.id}">
      Open Dashboard
    </a>
  </div>
`,
  });

  console.log("✅ Refund request email sent");
}
