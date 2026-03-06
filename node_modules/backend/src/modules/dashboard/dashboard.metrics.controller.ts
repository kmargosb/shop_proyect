import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getDashboardMetricsController = asyncHandler(
  async (req: Request, res: Response) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      totalOrders,
      totalRevenue,
      todayRevenue,
      refundedAmount
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
      })

    ]);

    res.json({
      todayOrders,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount ?? 0,
      todayRevenue: todayRevenue._sum.totalAmount ?? 0,
      refundedAmount: refundedAmount._sum.amount ?? 0
    });

  }
);