import { Request, Response } from "express";
import { generateInvoicePDF } from "./invoice.generator";

export async function downloadInvoice(req: Request, res: Response) {
  const id = req.params.id as string;

  const pdfBuffer = await generateInvoicePDF(id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${id}.pdf`
  );

  res.send(pdfBuffer);
}