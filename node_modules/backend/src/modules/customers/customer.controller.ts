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