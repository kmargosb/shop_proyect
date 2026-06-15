import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getRevenueChartController = asyncHandler(
  async (_req: Request, res: Response) => {
    const [orders, refunds] = await prisma.$transaction([
      prisma.order.findMany({
        where: {
          status: {
            in: [
              "PAID",
              "SHIPPED",
              "DELIVERED",
              "PARTIALLY_REFUNDED",
              "REFUNDED",
            ],
          },
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.refund.findMany({
        where: {
          status: "SUCCEEDED",
        },
        select: {
          amount: true,
          updatedAt: true,
        },
      }),
    ]);

    const chartMap = new Map<
      string,
      {
        grossRevenue: number;
        refunded: number;
      }
    >();

    /* =========================
       GROSS REVENUE
    ========================= */

    for (const order of orders) {
      const date = order.createdAt.toLocaleDateString("sv-SE");

      const current = chartMap.get(date) ?? {
        grossRevenue: 0,
        refunded: 0,
      };

      current.grossRevenue += order.totalAmount;

      chartMap.set(date, current);
    }

    /* =========================
       REFUNDS
    ========================= */

    for (const refund of refunds) {
      const date = refund.updatedAt.toLocaleDateString("sv-SE");

      const current = chartMap.get(date) ?? {
        grossRevenue: 0,
        refunded: 0,
      };

      current.refunded += refund.amount;

      chartMap.set(date, current);
    }

    const result = Array.from(chartMap.entries())
      .map(([date, values]) => ({
        date,

        grossRevenue: values.grossRevenue,

        refunded: values.refunded,

        netRevenue:
          values.grossRevenue - values.refunded,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

      console.log("ORDERS", orders);
console.log("REFUNDS", refunds);
console.log("RESULT", result);

    res.json(result);
  },
);