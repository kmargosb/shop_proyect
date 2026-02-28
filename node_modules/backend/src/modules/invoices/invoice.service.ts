import { prisma } from "@/lib/prisma";

export async function createInvoiceFromOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      invoice: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // ✅ evitar duplicadas
  if (order.invoice) {
    return order.invoice;
  }

  // ✅ siguiente número de factura
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  const nextInvoiceNumber = lastInvoice
    ? lastInvoice.invoiceNumber + 1
    : 1;

  // ✅ crear factura
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: nextInvoiceNumber,
      orderId: order.id,
      customerEmail: order.email,
      total: order.total,
    },
  });

  return invoice;
}