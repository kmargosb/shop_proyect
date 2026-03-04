import { Request, Response } from "express"
import { prisma } from "@/lib/prisma"

export const getOrderAnalytics = async (req: Request, res: Response) => {

  const today = new Date()
  today.setHours(0,0,0,0)

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const revenueToday = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: "PAID",
      createdAt: { gte: today }
    }
  })

  const revenueMonth = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: "PAID",
      createdAt: { gte: monthStart }
    }
  })

  const ordersToday = await prisma.order.count({
    where: {
      createdAt: { gte: today }
    }
  })

  const totalOrders = await prisma.order.count()

  res.json({
    revenueToday: revenueToday._sum.totalAmount || 0,
    revenueMonth: revenueMonth._sum.totalAmount || 0,
    ordersToday,
    totalOrders
  })
}