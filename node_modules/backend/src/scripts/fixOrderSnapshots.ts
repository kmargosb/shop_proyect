import { prisma } from "../lib/prisma";

async function run() {
  const items = await prisma.orderItem.findMany({
    include: {
      product: true,
    },
  });

  for (const item of items) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        productName: item.product.name,
      },
    });
  }

  console.log("✅ Order snapshots fixed");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());