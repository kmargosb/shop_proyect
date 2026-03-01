import { prisma } from "@/lib/prisma";
import { sendEmail } from "./email.service";
import { orderConfirmationTemplate } from "./email.templates";
import { generateInvoicePDF } from "@/modules/invoices/invoice.generator";

export async function sendOrderConfirmationEmail(orderId: string) {
  console.log("📧 EMAIL FUNCTION TRIGGERED");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      invoice: true,
    },
  });

  if (!order || !order.invoice) {
    console.log("❌ Order or invoice missing");
    return;
  }

  console.log("📧 Sending email to:", order.email);

  const pdf = await generateInvoicePDF(order.invoice.id);

  const publicUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`;

  const html = orderConfirmationTemplate(
    order.fullName,
    order.id,
    publicUrl
  );

  await sendEmail(order.email, "Pedido confirmado", html, [
    {
      filename: `invoice-${order.invoice.invoiceNumber}.pdf`,
      content: pdf,
    },
  ]);

  console.log("✅ Email sendEmail() executed");
}