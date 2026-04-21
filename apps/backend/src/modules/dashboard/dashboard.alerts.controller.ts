import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getAlertsController = asyncHandler(
  async (_req: Request, res: Response) => {

    const lowStock = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
      },
      select: {
        name: true,
        stock: true,
      },
      take: 5,
    });

    const refunds = await prisma.refund.aggregate({
      _sum: { amount: true },
    });

    const alerts = [];

    if (lowStock.length > 0) {
      alerts.push({
        type: "STOCK",
        message: `${lowStock.length} productos con poco stock`,
      });
    }

    if ((refunds._sum.amount ?? 0) > 10000) {
      alerts.push({
        type: "REFUND",
        message: "Alto volumen de reembolsos",
      });
    }

    res.json(alerts);
  }
);