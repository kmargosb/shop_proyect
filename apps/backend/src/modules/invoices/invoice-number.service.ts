import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(tx: any) {
  const year = new Date().getFullYear();

  const sequence = await tx.invoiceSequence.upsert({
    where: { year },
    update: {
      current: {
        increment: 1,
      },
    },
    create: {
      year,
      current: 1,
    },
  });

  const padded = sequence.current
    .toString()
    .padStart(6, "0");

  return `INV-${year}-${padded}`;
}