import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getSalesByCountryController = asyncHandler(
  async (_req: Request, res: Response) => {

    const sales = await prisma.order.groupBy({

      by: ["country"],

      where: {
        status: {
          in: ["PAID", "SHIPPED", "PARTIALLY_REFUNDED"]
        }
      },

      _sum: {
        totalAmount: true
      },

      _count: {
        _all: true
      },

      orderBy: {
        _sum: {
          totalAmount: "desc"
        }
      }

    });

    const result = sales.map(c => {

      const count = c._count as { _all: number };

      return {
        country: c.country,
        orders: count._all,
        revenue: c._sum?.totalAmount ?? 0
      };

    });

    res.json(result);

  }
);