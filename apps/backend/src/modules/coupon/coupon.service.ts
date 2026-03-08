import { prisma } from "@/lib/prisma"
import { CouponType } from "@prisma/client"

export const CouponService = {

  /* ==========================================
     VALIDATE COUPON
  ========================================== */

  async validateCoupon(code: string, orderAmount: number) {

    const coupon = await prisma.coupon.findUnique({
      where: { code }
    })

    if (!coupon) {
      throw new Error("Invalid coupon code")
    }

    if (!coupon.isActive) {
      throw new Error("Coupon inactive")
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("Coupon expired")
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error("Coupon usage limit reached")
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new Error("Order amount too low for this coupon")
    }

    let discount = 0

    if (coupon.type === CouponType.PERCENTAGE) {

      discount = Math.floor(orderAmount * (coupon.value / 100))

    }

    if (coupon.type === CouponType.FIXED) {

      discount = coupon.value

    }

    const finalAmount = Math.max(orderAmount - discount, 0)

    return {
      coupon,
      discount,
      finalAmount
    }

  },

  /* ==========================================
     APPLY COUPON TO ORDER
  ========================================== */

  async applyCoupon(orderId: string, code: string) {

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "PENDING") {
      throw new Error("Coupon can only be applied before payment")
    }

    const { coupon, discount, finalAmount } =
      await this.validateCoupon(code, order.totalAmount)

    const updatedOrder = await prisma.$transaction(async (tx) => {

      await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          usedCount: {
            increment: 1
          }
        }
      })

      const orderUpdated = await tx.order.update({
        where: { id: orderId },
        data: {
          totalAmount: finalAmount
        }
      })

      await tx.orderEvent.create({
        data: {
          orderId,
          type: "ORDER_UPDATED",
          message: `Coupon ${coupon.code} applied (-${discount})`
        }
      })

      return orderUpdated

    })

    return {
      discount,
      finalAmount,
      order: updatedOrder
    }

  },

  /* ==========================================
     CREATE COUPON (ADMIN)
  ========================================== */

  async createCoupon(data: {
    code: string
    type: CouponType
    value: number
    minOrderAmount?: number
    maxUses?: number
    expiresAt?: Date
  }) {

    const existing = await prisma.coupon.findUnique({
      where: { code: data.code }
    })

    if (existing) {
      throw new Error("Coupon code already exists")
    }

    const coupon = await prisma.coupon.create({
      data
    })

    return coupon

  },

  /* ==========================================
     LIST COUPONS
  ========================================== */

  async listCoupons() {

    return prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

  }

}