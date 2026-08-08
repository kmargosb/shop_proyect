import { prisma } from '../lib/prisma';

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  console.log('👤 Users will be preserved.');

  // ===============================
  // ORDERS / PAYMENTS
  // ===============================

  await prisma.refundItem.deleteMany();
  await prisma.refund.deleteMany();

  await prisma.orderTransaction.deleteMany();
  await prisma.orderEvent.deleteMany();

  await prisma.paymentSession.deleteMany();

  await prisma.inventoryReservation.deleteMany();

  await prisma.orderItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();

  // ===============================
  // CART
  // ===============================

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  // ===============================
  // AUTH
  // ===============================

  await prisma.refreshToken.deleteMany();

  // ===============================
  // ANALYTICS
  // ===============================

  await prisma.analyticsEvent.deleteMany();

  // ===============================
  // PRODUCTS
  // ===============================

  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  console.log('✅ Database cleaned.');
  console.log('👤 Users preserved.');
}

clearDatabase()
  .catch((error) => {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
