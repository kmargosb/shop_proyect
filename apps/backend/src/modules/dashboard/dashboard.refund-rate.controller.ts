import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getRefundRateController = asyncHandler(
    async (req: Request, res: Response) => {

        const [revenue, refunds] = await prisma.$transaction([

            prisma.order.aggregate({
                _sum: {
                    totalAmount: true
                },
                where: {
                    status: {
                        in: ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"]
                    }
                }
            }),

            prisma.refund.aggregate({
                _sum: {
                    amount: true
                },
                where: {
                    status: "SUCCEEDED"
                }
            })

        ]);

        const totalRevenue = revenue._sum.totalAmount ?? 0;
        const refundedAmount = refunds._sum.amount ?? 0;

        const refundRate =
            totalRevenue === 0
                ? 0
                : Number(((refundedAmount / totalRevenue) * 100).toFixed(2));

        res.json({
            totalRevenue,
            refundedAmount,
            refundRate
        });

    }
);