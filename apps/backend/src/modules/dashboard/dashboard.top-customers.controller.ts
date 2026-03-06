import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getTopCustomersController = asyncHandler(
    async (_req: Request, res: Response) => {

        const customers = await prisma.order.groupBy({

            by: ["email"],

            where: {
                status: {
                    in: ["PAID", "SHIPPED", "PARTIALLY_REFUNDED"]
                }
            },

            _count: {
                _all: true
            },

            _sum: {
                totalAmount: true
            },

            _max: {
                createdAt: true
            },

            orderBy: {
                _sum: {
                    totalAmount: "desc"
                }
            },

            take: 10

        });

        const result = customers.map(c => {

            const count = c._count as { _all: number };

            return {
                email: c.email,
                totalOrders: count._all,
                totalSpent: c._sum?.totalAmount ?? 0,
                lastPurchase: c._max?.createdAt ?? null
            };

        });

        res.json(result);

    }
);