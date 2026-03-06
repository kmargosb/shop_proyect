import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getRevenueChartController = asyncHandler(
    async (_req: Request, res: Response) => {

        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["PAID", "SHIPPED", "PARTIALLY_REFUNDED"]
                }
            },
            select: {
                totalAmount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        const revenueByDay: Record<string, number> = {};

        for (const order of orders) {

            const date = order.createdAt.toISOString().split("T")[0];

            revenueByDay[date] =
                (revenueByDay[date] ?? 0) + order.totalAmount;

        }

        const result = Object.entries(revenueByDay).map(
            ([date, revenue]) => ({
                date,
                revenue
            })
        );

        res.json(result);

    }
);