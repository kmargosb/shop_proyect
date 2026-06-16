import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { OrderStatus } from "@prisma/client";

const validStatuses: OrderStatus[] = [
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

export const getFinancialSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const period =
      (req.query.period as "day" | "month" | "year" | "total") || "total";

    const now = new Date();

    let startDate: Date | null = null;

    switch (period) {
      case "day":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;

      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;

      case "total":
      default:
        startDate = null;
    }

    const orderWhere = startDate
      ? {
          createdAt: {
            gte: startDate,
          },
          status: {
            in: validStatuses,
          },
        }
      : {
          status: {
            in: validStatuses,
          },
        };

    const refundWhere = startDate
      ? {
          updatedAt: {
            gte: startDate,
          },
          status: "SUCCEEDED" as const,
        }
      : {
          status: "SUCCEEDED" as const,
        };

    const [revenue, refunds, ordersCount] = await prisma.$transaction([
      prisma.order.aggregate({
        where: orderWhere,
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.refund.aggregate({
        where: refundWhere,
        _sum: {
          amount: true,
        },
      }),

      prisma.order.count({
        where: orderWhere,
      }),
    ]);

    const grossRevenue = revenue?._sum?.totalAmount ?? 0;

    const refundedAmount = refunds?._sum?.amount ?? 0;

    const netRevenue = grossRevenue - refundedAmount;

    const averageTicket = ordersCount > 0 ? grossRevenue / ordersCount : 0;

    res.json({
      period,
      grossRevenue,
      refundedAmount,
      netRevenue,
      totalOrders: ordersCount,
      averageTicket,
    });
  },
);
