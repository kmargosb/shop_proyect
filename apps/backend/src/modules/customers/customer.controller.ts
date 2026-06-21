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
  },
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
      0,
    );

    res.json({
      customer: email,
      totalOrders: orders.length,
      totalSpent,
      orders,
    });
  },
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
  },
);

/* =========================================================
   USER: GET MY ADDRESSES
========================================================= */

export const getMyAddressesController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
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
  },
);

/* =========================================================
   USER: CREATE ADDRESS
========================================================= */

export const createAddressController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const normalize = (str?: string) => str?.trim().toLowerCase();

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
    } = req.body;

    const existingCount = await prisma.address.count({
      where: { userId },
    });

    /* ===============================
       AVOID DUPLICATES
    =============================== */

    const existingAddress = await prisma.address.findFirst({
      where: {
        userId,
        addressLine1: normalize(addressLine1),
        city: normalize(city),
        postalCode: normalize(postalCode),
        country,
      },
    });

    if (existingAddress) {
      return res.json(existingAddress);
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        addressLine1: normalize(addressLine1) || "",
        addressLine2: addressLine2 || "",
        city: normalize(city) || "",
        postalCode: normalize(postalCode) || "",
        country,
        isDefault: existingCount === 0,
      },
    });

    /* ===============================
   AUTO FILL USER PROFILE
================================= */

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        phone: true,
      },
    });

    if (user && (!user.name || !user.phone)) {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...(user.name ? {} : { name: fullName?.trim() || null }),
          ...(user.phone ? {} : { phone: phone?.trim() || null }),
        },
      });
    }

    res.status(201).json(address);
  },
);

/* =========================================================
   USER: UPDATE ADDRESS
========================================================= */

export const updateAddressController = asyncHandler(
  async (req: AuthRequest & { params: { id: string } }, res: Response) => {
    const userId = req.user?.id;

    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        error: "Dirección no encontrada",
      });
    }

    const normalize = (str?: string) => str?.trim().toLowerCase();

    const updated = await prisma.address.update({
      where: { id },

      data: {
        fullName: req.body.fullName,
        phone: req.body.phone,
        addressLine1: normalize(req.body.addressLine1) || "",
        addressLine2: req.body.addressLine2 || "",
        city: normalize(req.body.city) || "",
        postalCode: normalize(req.body.postalCode) || "",
        country: req.body.country,
      },
    });

    res.json(updated);
  },
);

/* =========================================================
   USER: DELETE ADDRESS
========================================================= */

export const deleteAddressController = asyncHandler(
  async (req: AuthRequest & { params: { id: string } }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prisma.address.deleteMany({
      where: {
        id,
        userId, // 🔥 seguridad
      },
    });

    res.json({ success: true });
  },
);

/* =========================================================
   USER: SET DEFAULT ADDRESS (FAVORITE)
========================================================= */

export const setDefaultAddressController = asyncHandler(
  async (req: AuthRequest & { params: { id: string } }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /* ===============================
       🔒 CHECK ADDRESS OWNERSHIP
    =============================== */
    const address = await prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        error: "Dirección no encontrada",
      });
    }

    /* ===============================
       🔥 SET FAVORITE (FIX REAL)
    =============================== */
    await prisma.$transaction(async (tx) => {
      // quitar favorito a todas
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // poner favorito SOLO a esta (y validar userId)
      const updated = await tx.address.updateMany({
        where: {
          id,
          userId,
        },
        data: { isDefault: true },
      });

      if (updated.count === 0) {
        throw new Error("No se pudo actualizar la dirección");
      }
    });

    res.json({ success: true });
  },
);

/* =========================================================
   USER: GET PREFERENCES
========================================================= */

export const getPreferencesController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        marketingEmails: true,
      },
    });

    res.json(user);
  },
);

/* =========================================================
   USER: UPDATE PREFERENCES
========================================================= */

export const updatePreferencesController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { marketingEmails } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        marketingEmails: Boolean(marketingEmails),
      },
      select: {
        marketingEmails: true,
      },
    });

    res.json(user);
  },
);

export const updateProfileController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { name, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name?.trim() || null,
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    res.json(updatedUser);
  },
);
