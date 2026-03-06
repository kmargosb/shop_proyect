import { prisma } from "@/lib/prisma";

export async function getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
}) {

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = params.search
        ? {
            email: {
                contains: params.search,
                mode: "insensitive" as const,
            },
        }
        : {};

    const [customers, total] = await prisma.$transaction([

        prisma.order.groupBy({
            by: ["email"],
            where,

            _count: {
                _all: true
            },

            _sum: {
                totalAmount: true,
            },

            _max: {
                createdAt: true,
            },

            orderBy: {
                email: "asc",
            },

            skip,
            take: limit,
        }),

        prisma.order.groupBy({
            by: ["email"],
            where,

            orderBy: {
                email: "asc",
            },
        }),
    ]);

    return {
        data: customers.map((c) => {
            const count = c._count as { _all: number }

            return {
                email: c.email,
                totalOrders: count._all,
                totalSpent: c._sum?.totalAmount ?? 0,
                lastPurchase: c._max?.createdAt ?? null,
            }
        }),

        pagination: {
            total: total.length,
            page,
            limit,
            totalPages: Math.ceil(total.length / limit),
        },
    };
}