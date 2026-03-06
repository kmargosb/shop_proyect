import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getInventoryAlertsController = asyncHandler(
  async (req: Request, res: Response) => {

    const lowStockThreshold = Number(req.query.threshold ?? 5);

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: lowStockThreshold
        }
      },
      select: {
        id: true,
        name: true,
        stock: true
      },
      orderBy: {
        stock: "asc"
      }
    });

    const alerts = products.map(product => {

      let level = "low_stock";

      if (product.stock === 0) {
        level = "out_of_stock";
      }

      return {
        productId: product.id,
        product: product.name,
        stock: product.stock,
        alert: level
      };

    });

    res.json(alerts);
  }
);