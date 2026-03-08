import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";

type CreateOrderInput = {
  userId?: string;
  items: {
    productId: string;
    quantity: number;
  }[];

  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export async function createOrder(data: CreateOrderInput) {
  const {
    userId,
    items,
    fullName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    postalCode,
    country,
  } = data;

  if (!items || items.length === 0) {
    throw new Error("La orden debe contener productos");
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let totalAmount = 0;

    const orderItemsData: {
      productId: string;
      productName: string;
      productSku?: string | null;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }

      totalAmount += product.price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: null,
        quantity: item.quantity,
        price: product.price,
      });

    }

    const order = await tx.order.create({
      data: {
        userId: userId ?? null,
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        country,

        totalAmount,
        currency: "eur",

        status: OrderStatus.PENDING,

        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 📦 Reserve inventory
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    for (const item of order.items) {

      await tx.inventoryReservation.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          expiresAt,
        },
      });

    }

    // 📌 Order Timeline
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: "ORDER_CREATED",
        message: "Order created",
      },
    });

    return order;
  });
}

/**
 * ============================
 * GET ORDERS
 * ============================
 */

export async function getOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status as OrderStatus;
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        refunds: true,
        transactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * ============================
 * UPDATE ORDER STATUS
 * ============================
 */

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new Error("Orden no encontrada");
    }

    const currentStatus = order.status;

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["PAYMENT_PROCESSING", "PAID", "CANCELLED"],

      PAYMENT_PROCESSING: ["PAID", "FAILED", "CANCELLED"],

      PAID: ["SHIPPED", "PARTIALLY_REFUNDED", "REFUNDED"],

      PARTIALLY_REFUNDED: ["REFUNDED"],

      FAILED: ["PAYMENT_PROCESSING", "CANCELLED"],

      SHIPPED: [],

      CANCELLED: [],

      REFUNDED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `No se puede cambiar estado de ${currentStatus} a ${newStatus}`,
      );
    }

    if (newStatus === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // 📌 Order Timeline
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type:
          newStatus === "SHIPPED"
            ? "ORDER_SHIPPED"
            : newStatus === "CANCELLED"
              ? "ORDER_CANCELLED"
              : "ORDER_UPDATED",
        message: `Order status changed to ${newStatus}`,
      },
    });

    if (newStatus === "PAID" && !order.invoice) {
      const { createInvoiceFromOrder } =
        await import("@/modules/invoices/invoice.service");

      const { sendOrderConfirmationEmail } =
        await import("@/modules/email/sendOrderEmail");

      await createInvoiceFromOrder(orderId);
      await sendOrderConfirmationEmail(orderId);
    }

    return updatedOrder;
  });
}

export async function searchOrders(params: {
  query?: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.query) {
    where.OR = [
      {
        id: {
          contains: params.query,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: params.query,
          mode: "insensitive",
        },
      },
      {
        fullName: {
          contains: params.query,
          mode: "insensitive",
        },
      },
    ];
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        invoice: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}