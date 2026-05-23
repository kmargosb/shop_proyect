import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { RefundService } from "@/modules/refunds/refund.service";

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

/* =========================================================
   CREATE ORDER
========================================================= */

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

    /* =========================
       VALIDATE STOCK
    ========================= */

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          reservedStock: true,
        },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      const availableStock =
  product.stock - product.reservedStock;

if (item.quantity > availableStock) {
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

    /* =========================
       CREATE ORDER
    ========================= */

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

    const normalize = (str?: string) => str?.trim().toLowerCase();

    /* =========================
   SAVE ADDRESS (AUTO)
   ========================= */

    if (userId) {
      const existing = await tx.address.findFirst({
        where: {
          userId,
          addressLine1: normalize(addressLine1),
          city: normalize(city),
          postalCode: normalize(postalCode),
          country,
        },
      });

      if (!existing) {
        await tx.address.create({
          data: {
            userId,
            fullName,
            phone,
            addressLine1: normalize(addressLine1) || "",
            addressLine2,
            city: normalize(city) || "",
            postalCode: normalize(postalCode) || "",
            country,
          },
        });
      }
    }

    /* =========================
       RESERVE INVENTORY
    ========================= */

    const { InventoryService } =
      await import("@/modules/inventory/inventory.service");

    for (const item of order.items) {
      await InventoryService.reserveStock(
        tx,
        item.productId,
        order.id,
        item.quantity,
      );
    }

    /* =========================
       ORDER TIMELINE
    ========================= */

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

/* =========================================================
   GET ORDERS (ADMIN)
========================================================= */

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
        shipment: true,

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

        refunds: {
          include: {
            items: { include: { orderItem: true } },
            evidence: true,
          },
        },

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

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

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

      PAID: ["SHIPPED", "PARTIALLY_REFUNDED", "REFUNDED", "CANCELLED"],

      PARTIALLY_REFUNDED: ["REFUNDED"],

      FAILED: ["PAYMENT_PROCESSING", "CANCELLED"],

      SHIPPED: ["DELIVERED"],

      DELIVERED: [],

      CANCELLED: [],

      REFUNDED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `No se puede cambiar estado de ${currentStatus} a ${newStatus}`,
      );
    }

    /* =========================
       UPDATE STATUS
    ========================= */

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    /* =========================
       ORDER TIMELINE
    ========================= */

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

    /* =========================
       INVOICE + EMAIL
    ========================= */

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

/* =========================================================
   CANCEL ORDER
========================================================= */

export async function cancelOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },

    include: {
      items: true,

      shipment: true,

      refunds: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  /* =========================
     BLOCK SHIPPED
  ========================= */

  if (order.status === "SHIPPED") {
    throw new Error("Shipped orders cannot be cancelled");
  }

  /* =========================
     ALREADY CANCELLED
  ========================= */

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    throw new Error("Order already cancelled");
  }

  /* =========================
     PAYMENT NOT COMPLETED
  ========================= */

  if (
    order.status === "PENDING" ||
    order.status === "PAYMENT_PROCESSING" ||
    order.status === "FAILED"
  ) {
    const { InventoryService } =
      await import("@/modules/inventory/inventory.service");

    await InventoryService.releaseReservation(order.id);

    await prisma.order.update({
      where: { id: order.id },

      data: {
        status: "CANCELLED",
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,

        type: "ORDER_CANCELLED",

        message: "Order cancelled before payment",
      },
    });

    return;
  }

  /* =========================
     PAID → FULL REFUND
  ========================= */

  if (order.status === "PAID") {
    await RefundService.createRefund(
      order.id,

      order.items.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      })),

      "ORDER_CANCELLED",
    );

    await prisma.order.update({
      where: { id: order.id },

      data: {
        status: "REFUNDED",
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,

        type: "ORDER_CANCELLED",

        message: "Order cancelled and refunded",
      },
    });

    return;
  }

  throw new Error("Order cannot be cancelled");
}

/* =========================================================
   SEARCH ORDERS
========================================================= */

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
        shipment: true,

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
