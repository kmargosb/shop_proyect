import { prisma } from "@/lib/prisma"
import { sendEmail } from "./email.service"
import { orderConfirmationTemplate } from "./email.templates"
import { generateInvoicePDF } from "@/modules/invoices/invoice.generator"

export async function sendOrderConfirmationEmail(orderId: string) {

  console.log("📧 Order confirmation email triggered")

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      invoice: true
    }
  })

  if (!order) {
    console.warn("⚠ Order not found:", orderId)
    return
  }

  if (!order.invoice) {
    console.warn("⚠ Invoice missing for order:", orderId)
    return
  }

  console.log("📧 Sending email to:", order.email)

  /* =========================
     GENERATE INVOICE PDF
  ========================= */

  const pdfBuffer = await generateInvoicePDF(order.invoice.id)

  /* =========================
     PUBLIC ORDER LINK
  ========================= */

  const publicUrl = `${process.env.FRONTEND_URL}/orders/${order.id}?email=${order.email}`

  /* =========================
     EMAIL HTML
  ========================= */

  const html = orderConfirmationTemplate(
    order.fullName,
    order.id,
    publicUrl
  )

  /* =========================
     SEND EMAIL
  ========================= */

  await sendEmail({
    to: order.email,
    subject: "Pedido confirmado",
    html,
    attachments: [
      {
        filename: `invoice-${order.invoice.invoiceNumber}.pdf`,
        content: pdfBuffer
      }
    ]
  })

  console.log("✅ Order confirmation email sent")

}