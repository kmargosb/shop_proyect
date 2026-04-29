import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { getCustomers } from "./customer.service";
import { AuthRequest } from "@/common/middleware/auth.middleware";

/* =========================================================
   ADMIN: GET CUSTOMERS
========================================================= */

export const getCustomersController = asyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;

    const result = await getCustomers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search as string | undefined,
    });

    res.json(result);
  }
);

/* =========================================================
   ADMIN: CUSTOMER ORDERS
========================================================= */

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
                name: true,
              },
            },
          },
        },
        invoice: true,
        refunds: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({
      customer: email,
      totalOrders: orders.length,
      totalSpent,
      orders,
    });
  }
);

/* =========================================================
   ADMIN: CUSTOMER ANALYTICS
========================================================= */

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
          createdAt: true,
        },
      }),

      prisma.order.aggregate({
        where: { email },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      }),
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
      lastPurchase,
    });
  }
);

/* =========================================================
   USER: GET MY ADDRESSES
========================================================= */

export const getMyAddressesController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "No autorizado",
      });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" }, // 🔥 favorita primero
        { createdAt: "desc" },
      ],
    });

    res.json(addresses);
  }
);

/* =========================================================
   USER: DELETE ADDRESS
========================================================= */

export const deleteAddressController = asyncHandler(
  async (req: AuthRequest & { params: { id: string } }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    await prisma.address.deleteMany({
      where: {
        id,
        userId, // 🔥 seguridad
      },
    });

    res.json({ success: true });
  }
);

/* =========================================================
   USER: SET DEFAULT ADDRESS (FAVORITE)
========================================================= */

export const setDefaultAddressController = asyncHandler(
  async (req: AuthRequest & { params: { id: string } }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),

      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    res.json({ success: true });
  }
);