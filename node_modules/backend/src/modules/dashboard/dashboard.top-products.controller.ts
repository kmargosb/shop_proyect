import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getTopProductsController = asyncHandler(
  async (req: Request, res: Response) => {

    const limit = Number(req.query.limit ?? 5);

    const items = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: limit
    });

    const result = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantitySold: item._sum.quantity ?? 0,
      revenue: (item._sum.price ?? 0) * (item._sum.quantity ?? 0)
    }));

    res.json(result);
  }
);