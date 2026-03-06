import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getRevenueGrowthController = asyncHandler(
  async (_req: Request, res: Response) => {

    const now = new Date();

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth] = await prisma.$transaction([

      prisma.order.aggregate({
        where: {
          status: {
            in: ["PAID", "SHIPPED", "PARTIALLY_REFUNDED"]
          },
          createdAt: {
            gte: startOfThisMonth
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      prisma.order.aggregate({
        where: {
          status: {
            in: ["PAID", "SHIPPED", "PARTIALLY_REFUNDED"]
          },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          totalAmount: true
        }
      })

    ]);

    const thisMonthRevenue = thisMonth._sum.totalAmount ?? 0;
    const lastMonthRevenue = lastMonth._sum.totalAmount ?? 0;

    let growthPercentage = 0;

    if (lastMonthRevenue > 0) {
      growthPercentage =
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    res.json({
      thisMonthRevenue,
      lastMonthRevenue,
      growthPercentage: Math.round(growthPercentage * 100) / 100
    });

  }
);