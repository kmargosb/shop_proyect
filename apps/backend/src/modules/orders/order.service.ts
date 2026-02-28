import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { createInvoiceFromOrder } from "@/modules/invoices/invoice.service";

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

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let total = 0;

    const orderItemsData: {
      productId: string;
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

      total += product.price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
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
        total,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  });
}

export async function getOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.status) {
    where.status = params.status;
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
        invoice: true, // ✅ ahora admin podrá ver factura
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
 * Actualiza estado de orden con:
 * - Validación de transición
 * - Devolución automática de stock
 * - Creación automática de factura
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
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
      PENDING: ["PAID", "CANCELLED"],
      PAID: ["SHIPPED", "CANCELLED"],
      SHIPPED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `No se puede cambiar estado de ${currentStatus} a ${newStatus}`
      );
    }

    // ✅ devolver stock
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

    // ✅ crear factura automáticamente
    if (newStatus === "PAID" && !order.invoice) {
      await createInvoiceFromOrder(orderId);
    }

    return updatedOrder;
  });
}