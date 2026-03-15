import { prisma } from "../lib/prisma"

async function resetOrders() {

  console.log("🧹 Resetting orders...")

  /* =========================
     REFUNDS
  ========================= */

  await prisma.refundItem.deleteMany()
  await prisma.refund.deleteMany()

  /* =========================
     ORDER EVENTS
  ========================= */

  await prisma.orderTransaction.deleteMany()
  await prisma.orderEvent.deleteMany()

  /* =========================
     PAYMENT SESSIONS
  ========================= */

  await prisma.paymentSession.deleteMany()

  /* =========================
     INVENTORY RESERVATIONS
  ========================= */

  await prisma.inventoryReservation.deleteMany()

  /* =========================
     ORDER DATA
  ========================= */

  await prisma.orderItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()

  console.log("✅ Orders reset completed")

}

resetOrders()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })