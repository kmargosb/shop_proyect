import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getAlertsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },

      include: {
        variants: true,
      },

      take: 20,
    });

    const lowStock = products.filter((product) => {
      const totalStock = product.variants.reduce(
        (sum, variant) => sum + (variant.stock - variant.reservedStock),
        0,
      );

      return totalStock < 5;
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
  },
);
