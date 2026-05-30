import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getInventoryAlertsController = asyncHandler(
  async (req: Request, res: Response) => {
    const lowStockThreshold = Number(
      req.query.threshold ?? 5,
    );

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },

      include: {
        variants: true,
      },
    });

    const alerts = products
      .map((product) => {
        const totalStock =
          product.variants.reduce(
            (total, variant) =>
              total +
              (variant.stock -
                variant.reservedStock),
            0,
          );

        let level: string | null = null;

        if (totalStock === 0) {
          level = "out_of_stock";
        } else if (
          totalStock <= lowStockThreshold
        ) {
          level = "low_stock";
        }

        if (!level) {
          return null;
        }

        return {
          productId: product.id,
          product: product.name,
          stock: totalStock,
          alert: level,
        };
      })
      .filter(Boolean);

    res.json(alerts);
  },
);