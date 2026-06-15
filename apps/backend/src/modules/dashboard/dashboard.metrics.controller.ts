import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

function groupRevenueByDate(
  orders: {
    createdAt: Date;
    totalAmount: number;
  }[],
  refunds: {
    updatedAt: Date;
    amount: number;
  }[],
) {
  const map = new Map<
    string,
    {
      grossRevenue: number;
      refunded: number;
    }
  >();

  for (const order of orders) {
    const date = order.createdAt.toLocaleDateString("sv-SE");

    const current = map.get(date) ?? {
      grossRevenue: 0,
      refunded: 0,
    };

    current.grossRevenue += order.totalAmount;

    map.set(date, current);
  }

  for (const refund of refunds) {
    const date = refund.updatedAt.toLocaleDateString("sv-SE");

    const current = map.get(date) ?? {
      grossRevenue: 0,
      refunded: 0,
    };

    current.refunded += refund.amount;

    map.set(date, current);
  }

  return Array.from(map.entries())
    .map(([date, values]) => ({
      date,
      grossRevenue: values.grossRevenue,
      refunded: values.refunded,
      netRevenue: values.grossRevenue - values.refunded,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const getDashboardMetricsController = asyncHandler(
  async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    const [
      todayOrders,
      totalOrders,
      totalRevenue,
      todayRevenue,
      refundedAmount,
      orders7d,
      orders30d,
      refunds7d,
      refunds30d,
    ] = await prisma.$transaction([
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      prisma.order.count(),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
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
      }),

      prisma.order.aggregate({
        _sum: { totalAmount: true },
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
          createdAt: { gte: today },
        },
      }),

      prisma.refund.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCEEDED" },
      }),

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
          createdAt: { gte: last7Days },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),

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
          createdAt: { gte: last30Days },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),

      prisma.refund.findMany({
        where: {
          status: "SUCCEEDED",
          updatedAt: {
            gte: last7Days,
          },
        },
        select: {
          amount: true,
          updatedAt: true,
        },
      }),

      prisma.refund.findMany({
        where: {
          status: "SUCCEEDED",
          updatedAt: {
            gte: last30Days,
          },
        },
        select: {
          amount: true,
          updatedAt: true,
        },
      }),
    ]);

    const revenue7d = groupRevenueByDate(orders7d, refunds7d);
    const revenue30d = groupRevenueByDate(orders30d, refunds30d);
    const grossRevenue = totalRevenue._sum.totalAmount ?? 0;
    const totalRefunded = refundedAmount._sum.amount ?? 0;

    const netRevenue = grossRevenue - totalRefunded;

    res.json({
      todayOrders,
      totalOrders,

      grossRevenue,
      refundedAmount: totalRefunded,
      netRevenue,

      todayRevenue: todayRevenue._sum.totalAmount ?? 0,

      revenue7d,
      revenue30d,
    });
  },
);
