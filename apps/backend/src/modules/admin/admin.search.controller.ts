import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const globalSearchController = asyncHandler(
    async (req: Request, res: Response) => {

        const q = (req.query.q as string)?.trim();

        if (!q) {
            return res.json({
                products: [],
                orders: [],
                customers: []
            });
        }

        const [products, orders, customers] = await prisma.$transaction([

            prisma.product.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: "insensitive"
                    }
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true
                }
            }),

            prisma.order.findMany({
                where: {
                    OR: [
                        {
                            id: {
                                contains: q
                            }
                        },
                        {
                            email: {
                                contains: q,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                take: 5,
                select: {
                    id: true,
                    email: true,
                    totalAmount: true,
                    status: true
                }
            }),

            prisma.order.groupBy({
                by: ["email"],

                where: {
                    email: {
                        contains: q,
                        mode: "insensitive"
                    }
                },

                _count: {
                    _all: true
                },

                orderBy: {
                    email: "asc"
                },

                take: 5
            })

        ]);

        res.json({
            products,
            orders,
            customers: customers.map(c => ({
                email: c.email,
                totalOrders: (c._count as { _all: number })._all
            }))
        });

    }
);