import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getCustomerOrdersController = asyncHandler(
  async (req: Request<{ email: string }>, res: Response) => {

    const email = req.params.email;

        const orders = await prisma.order.findMany({
            where: { email },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                invoice: true,
                refunds: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const totalSpent = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );

        res.json({
            customer: email,
            totalOrders: orders.length,
            totalSpent,
            orders
        });

    }
);

export const getCustomerAnalyticsController = asyncHandler(
  async (req: Request<{ email: string }>, res: Response) => {

    const email = req.params.email;

    const [orders, stats] = await prisma.$transaction([

      prisma.order.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true
        }
      }),

      prisma.order.aggregate({
        where: { email },
        _sum: {
          totalAmount: true
        },
        _count: true
      })

    ]);

    const totalOrders = stats._count;
    const totalSpent = stats._sum.totalAmount ?? 0;

    const averageOrderValue =
      totalOrders === 0 ? 0 : Math.round(totalSpent / totalOrders);

    const lastPurchase = orders.length > 0 ? orders[0].createdAt : null;

    res.json({
      customer: email,
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastPurchase
    });

  }
);