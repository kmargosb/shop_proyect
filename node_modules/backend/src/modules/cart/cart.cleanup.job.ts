import { prisma } from "@/lib/prisma"

/**
 * =========================================================
 * CART CLEANUP JOB
 * =========================================================
 */

export async function cleanupExpiredCarts() {

  console.log("🧹 Running expired cart cleanup")

  const now = new Date()

  /* =========================
     1️⃣ MARK EXPIRED CARTS
  ========================= */

  const expired = await prisma.cart.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lt: now
      }
    },
    data: {
      status: "EXPIRED"
    }
  })

  /* =========================
     2️⃣ DELETE OLD EXPIRED CARTS
     (older than 7 days)
  ========================= */

  const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const deletedExpired = await prisma.cart.deleteMany({
    where: {
      status: "EXPIRED",
      updatedAt: {
        lt: oldDate
      }
    }
  })

  /* =========================
     3️⃣ DELETE EMPTY CARTS
  ========================= */

  const emptyCarts = await prisma.cart.deleteMany({
    where: {
      items: {
        none: {}
      },
      status: "ACTIVE",
      createdAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  })

  /* =========================
     4️⃣ DELETE CONVERTED CARTS
     (after order creation)
  ========================= */

  const convertedCarts = await prisma.cart.deleteMany({
    where: {
      status: "CONVERTED",
      updatedAt: {
        lt: oldDate
      }
    }
  })

  /* =========================
     LOGS
  ========================= */

  console.log(
    `🧹 Cart cleanup → expired:${expired.count} | deletedExpired:${deletedExpired.count} | empty:${emptyCarts.count} | converted:${convertedCarts.count}`
  )

}