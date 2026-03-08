import { prisma } from "@/lib/prisma"

export async function cleanupExpiredCarts() {

  const expired = await prisma.cart.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lt: new Date()
      }
    }
  })

  for (const cart of expired) {

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        status: "EXPIRED"
      }
    })

  }

  if (expired.length > 0) {
    console.log(`🧹 Cleaned ${expired.length} expired carts`)
  }

}