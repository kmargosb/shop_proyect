import { prisma } from "../lib/prisma"

async function clearDatabase() {

  await prisma.refundItem.deleteMany()
  await prisma.refund.deleteMany()

  await prisma.orderTransaction.deleteMany()
  await prisma.orderEvent.deleteMany()

  await prisma.paymentSession.deleteMany()

  await prisma.inventoryReservation.deleteMany()

  await prisma.orderItem.deleteMany()
  await prisma.invoice.deleteMany()

  await prisma.order.deleteMany()

  await prisma.refreshToken.deleteMany()

  console.log("Database cleaned")

}

clearDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect())