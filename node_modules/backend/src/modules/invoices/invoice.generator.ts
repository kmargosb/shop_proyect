import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export async function generateInvoicePDF(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const doc = new PDFDocument({
    margin: 50,
  });

  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });

    /* =====================
       HEADER
    ====================== */

    doc
      .fontSize(22)
      .text("MI TIENDA", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(16)
      .text("FACTURA", { align: "center" });

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Factura #: ${invoice.invoiceNumber}`);
    doc.text(
      `Fecha: ${invoice.createdAt.toLocaleDateString()}`
    );

    doc.moveDown();

    /* =====================
       CLIENTE
    ====================== */

    doc.fontSize(14).text("Cliente");

    doc.fontSize(12);
    doc.text(invoice.order.fullName);
    doc.text(invoice.order.email);
    doc.text(invoice.order.addressLine1);
    doc.text(
      `${invoice.order.postalCode} ${invoice.order.city}`
    );
    doc.text(invoice.order.country);

    doc.moveDown(2);

    /* =====================
       TABLA HEADER
    ====================== */

    const tableTop = doc.y;

    doc.font("Helvetica-Bold");
    doc.text("Producto", 50, tableTop);
    doc.text("Qty", 300, tableTop);
    doc.text("Precio", 350, tableTop);
    doc.text("Total", 450, tableTop);

    doc.moveDown();
    doc.font("Helvetica");

    let position = tableTop + 25;

    /* =====================
       ITEMS
    ====================== */

    invoice.order.items.forEach((item) => {
      const total = item.price * item.quantity;

      doc.text(item.product.name, 50, position);
      doc.text(item.quantity.toString(), 300, position);
      doc.text(`€${item.price.toFixed(2)}`, 350, position);
      doc.text(`€${total.toFixed(2)}`, 450, position);

      position += 25;
    });

    /* =====================
       TOTAL
    ====================== */

    doc.moveDown(2);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(
        `TOTAL: €${invoice.total.toFixed(2)}`,
        400,
        position + 20
      );

    /* =====================
       FOOTER
    ====================== */

    doc.moveDown(4);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "Gracias por tu compra",
        { align: "center" }
      );

    doc.end();
  });
}