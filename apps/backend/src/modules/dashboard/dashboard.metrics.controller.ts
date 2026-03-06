import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

function groupRevenueByDate(
  orders: { createdAt: Date; totalAmount: number }[]
) {
  const map = new Map<string, number>();

  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];

    map.set(date, (map.get(date) ?? 0) + order.totalAmount);
  }

  return Array.from(map.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

export const getDashboardMetricsController = asyncHandler(
  async (req: Request, res: Response) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    const [
      todayOrders,
      totalOrders,
      totalRevenue,
      todayRevenue,
      refundedAmount,
      orders7d,
      orders30d
    ] = await prisma.$transaction([

      prisma.order.count({
        where: {
          createdAt: { gte: today }
        }
      }),

      prisma.order.count(),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "PAID" }
      }),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: "PAID",
          createdAt: { gte: today }
        }
      }),

      prisma.refund.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCEEDED" }
      }),

      prisma.order.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: last7Days }
        },
        select: {
          createdAt: true,
          totalAmount: true
        }
      }),

      prisma.order.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: last30Days }
        },
        select: {
          createdAt: true,
          totalAmount: true
        }
      })

    ]);

    const revenue7d = groupRevenueByDate(orders7d);
    const revenue30d = groupRevenueByDate(orders30d);

    res.json({
      todayOrders,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      todayRevenue: todayRevenue._sum.totalAmount ?? 0,
      refundedAmount: refundedAmount._sum.amount ?? 0,
      revenue7d,
      revenue30d
    });

  }
);