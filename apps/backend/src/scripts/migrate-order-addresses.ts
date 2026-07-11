import { prisma } from '@/lib/prisma';

async function main() {
  const orders = await prisma.order.findMany();

  console.log(`Found ${orders.length} orders`);

  for (const order of orders) {
    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        shippingFullName: order.fullName,
        shippingPhone: order.phone,
        shippingAddressLine1: order.addressLine1,
        shippingAddressLine2: order.addressLine2,
        shippingCity: order.city,
        shippingPostalCode: order.postalCode,
        shippingCountry: order.country,

        billingFullName: order.fullName,
        billingPhone: order.phone,
        billingAddressLine1: order.addressLine1,
        billingAddressLine2: order.addressLine2,
        billingCity: order.city,
        billingPostalCode: order.postalCode,
        billingCountry: order.country,
      },
    });
  }

  console.log('✅ Orders migrated');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
