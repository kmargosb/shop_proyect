import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "./invoice-number.service";

export async function createInvoiceFromOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // ✅ evitar duplicar facturas
    if (order.invoice) {
      return order.invoice;
    }

    // ✅ generar número legal seguro
    const invoiceNumber = await generateInvoiceNumber(tx);

    // ✅ crear factura
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerEmail: order.email,
        total: order.total,
      },
    });

    return invoice;
  });
}