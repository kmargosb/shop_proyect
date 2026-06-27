import { prisma } from '@/lib/prisma';
import { getIO } from '@/lib/socket';
import { Prisma, OrderStatus } from '@prisma/client';
import { RefundService } from '@/modules/refunds/refund.service';
import Stripe from 'stripe';

type CreateOrderInput = {
  userId?: string;

  items: {
    productId: string;
    variantId?: string;
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

/* =========================================================
   CREATE ORDER
========================================================= */
export async function createOrderTx(tx: Prisma.TransactionClient, data: CreateOrderInput) {
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
    throw new Error('La orden debe contener productos');
  }

  const start = Date.now();

  let totalAmount = 0;

  const orderItemsData: {
    productId: string;
    variantId?: string;

    productName: string;
    productSku?: string | null;

    size?: any;
    color?: any;

    quantity: number;
    price: number;
  }[] = [];

  /* =========================
       VALIDATE STOCK
    ========================= */

  for (const item of items) {
    const variant = await tx.productVariant.findUnique({
      where: {
        id: item.variantId,
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      throw new Error('Variante no encontrada');
    }

    const availableStock = variant.stock - variant.reservedStock;

    if (item.quantity > availableStock) {
      throw new Error(`Stock insuficiente para ${variant.product.name}`);
    }

    totalAmount += variant.product.price * item.quantity;

    orderItemsData.push({
      productId: variant.product.id,
      variantId: variant.id,

      productName: variant.product.name,
      productSku: variant.sku ?? null,

      size: variant.size,
      color: variant.color,

      quantity: item.quantity,
      price: variant.product.price,
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
      currency: 'eur',
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
          addressLine1: normalize(addressLine1) || '',
          addressLine2,
          city: normalize(city) || '',
          postalCode: normalize(postalCode) || '',
          country,
        },
      });
    }
  }

  /* =========================
       RESERVE INVENTORY
    ========================= */

  const { InventoryService } = await import('@/modules/inventory/inventory.service');

  for (const item of order.items) {
    if (!item.variantId) {
      throw new Error('Order item sin variantId');
    }

    await InventoryService.reserveStock(tx, item.variantId, order.id, item.quantity);
  }

  /* =========================
       ORDER TIMELINE
    ========================= */

  await tx.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'ORDER_CREATED',
      message: 'Order created',
    },
  });

  return order;
}

export async function createOrder(data: CreateOrderInput) {
  return prisma.$transaction(async (tx) => {
    return createOrderTx(tx, data);
  });
}

/* =========================================================
   GET ORDERS (ADMIN)
========================================================= */

export async function getOrders(params: { page?: number; limit?: number; status?: string }) {
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

        refunds: true,

        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
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

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    const currentStatus = order.status;

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PAYMENT_PROCESSING', 'PAID', 'CANCELLED'],

      PAYMENT_PROCESSING: ['PAID', 'FAILED', 'CANCELLED'],

      PAID: ['SHIPPED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED'],

      PARTIALLY_REFUNDED: ['REFUNDED'],

      FAILED: ['PAYMENT_PROCESSING', 'CANCELLED'],

      SHIPPED: ['DELIVERED'],

      DELIVERED: [],

      CANCELLED: [],

      REFUNDED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`No se puede cambiar estado de ${currentStatus} a ${newStatus}`);
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
          newStatus === 'SHIPPED'
            ? 'ORDER_SHIPPED'
            : newStatus === 'CANCELLED'
              ? 'ORDER_CANCELLED'
              : 'ORDER_UPDATED',
        message: `Order status changed to ${newStatus}`,
      },
    });

    /* =========================
       INVOICE + EMAIL
    ========================= */

    if (newStatus === 'PAID' && !order.invoice) {
      const { createInvoiceFromOrder } = await import('@/modules/invoices/invoice.service');

      const { sendOrderConfirmationEmail } = await import('@/modules/email/sendOrderEmail');

      await createInvoiceFromOrder(orderId);

      await sendOrderConfirmationEmail(orderId);
    }

    return updatedOrder;
  });
}

/* =========================================================
   CANCEL ORDER
========================================================= */

export async function cancelOrder(orderId: string, reason?: string) {
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
    throw new Error('Order not found');
  }

  /* =========================
     BLOCK SHIPPED
  ========================= */

  if (order.status === 'SHIPPED') {
    throw new Error('Shipped orders cannot be cancelled');
  }

  /* =========================
     ALREADY CANCELLED
  ========================= */

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    throw new Error('Order already cancelled');
  }

  /* =========================
     PAYMENT NOT COMPLETED
  ========================= */

  if (
    order.status === 'PENDING' ||
    order.status === 'PAYMENT_PROCESSING' ||
    order.status === 'FAILED'
  ) {
    const { InventoryService } = await import('@/modules/inventory/inventory.service');

    await InventoryService.releaseReservation(order.id);

    await prisma.order.update({
      where: { id: order.id },

      data: {
        status: 'CANCELLED',
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,

        type: 'ORDER_CANCELLED',

        message: reason
          ? `Order cancelled before payment (${reason})`
          : 'Order cancelled before payment',
      },
    });

    return;
  }

  /* =========================
     PAID → FULL REFUND
  ========================= */

  if (order.status === 'PAID') {
    const refund = await RefundService.createRefund(
      order.id,

      order.items.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      })),

      'ORDER_CANCELLED',

      reason,
    );

    await RefundService.approveRefund(refund.refundId);

    await RefundService.markRefundReceived(refund.refundId);

    await RefundService.processRefund(refund.refundId);

    for (const item of order.items) {
      if (!item.variantId) continue;

      await prisma.productVariant.update({
        where: {
          id: item.variantId,
        },

        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'ORDER_CANCELLED',
        message: reason
          ? `Order cancelled and refunded (${reason})`
          : 'Order cancelled and refunded',
      },
    });
    return;
  }
  throw new Error('Order cannot be cancelled');
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
          mode: 'insensitive',
        },
      },

      {
        email: {
          contains: params.query,
          mode: 'insensitive',
        },
      },

      {
        fullName: {
          contains: params.query,
          mode: 'insensitive',
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
        createdAt: 'desc',
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

export async function updateOrderAdmin(
  orderId: string,
  data: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;

    items?: {
      orderItemId: string;
      variantId: string;
      quantity: number;
    }[];
  },
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }
    const oldTotal = order.totalAmount;

    /* =========================
       BLOCK EDITING
    ========================= */

    if (
      order.status === 'SHIPPED' ||
      order.status === 'DELIVERED' ||
      order.status === 'REFUNDED' ||
      order.status === 'CANCELLED'
    ) {
      throw new Error('This order can no longer be edited');
    }

    /* =========================
       UPDATE CUSTOMER DATA
    ========================= */

    const updatedOrder = await tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,

        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,

        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      },
    });

    /* =========================
       UPDATE VARIANTS
    ========================= */

    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const currentItem = await tx.orderItem.findUnique({
          where: {
            id: item.orderItemId,
          },
        });

        if (!currentItem) {
          continue;
        }

        const removedQuantity = currentItem.quantity - item.quantity;

        const sameVariant = currentItem.variantId === item.variantId;

        if (sameVariant && currentItem.quantity === item.quantity) {
          continue;
        }

        const oldVariant = await tx.productVariant.findUnique({
          where: {
            id: currentItem.variantId ?? undefined,
          },
        });

        const newVariant = await tx.productVariant.findUnique({
          where: {
            id: item.variantId,
          },
        });

        if (!newVariant) {
          throw new Error('Variant not found');
        }

        const availableStock = newVariant.stock - newVariant.reservedStock;

        const quantityDiff = item.quantity - currentItem.quantity;

        if (quantityDiff > 0 && availableStock < quantityDiff) {
          throw new Error(`Not enough stock for ${newVariant.size} ${newVariant.color}`);
        }

        /* =========================
              SAME VARIANT
        ========================= */

        if (sameVariant) {
          const diff = item.quantity - currentItem.quantity;

          /* =========================
     PENDING / PAYMENT_PROCESSING
  ========================= */

          if (order.status === 'PENDING' || order.status === 'PAYMENT_PROCESSING') {
            if (diff > 0) {
              await tx.productVariant.update({
                where: {
                  id: newVariant.id,
                },
                data: {
                  reservedStock: {
                    increment: diff,
                  },
                },
              });
            }

            if (diff < 0) {
              await tx.productVariant.update({
                where: {
                  id: newVariant.id,
                },
                data: {
                  reservedStock: {
                    decrement: Math.abs(diff),
                  },
                },
              });
            }
          }

          /* =========================
     PAID
  ========================= */

          if (order.status === 'PAID') {
            if (diff > 0) {
              await tx.productVariant.update({
                where: {
                  id: newVariant.id,
                },
                data: {
                  stock: {
                    decrement: diff,
                  },
                },
              });
            }

            if (diff < 0) {
              await tx.productVariant.update({
                where: {
                  id: newVariant.id,
                },
                data: {
                  stock: {
                    increment: Math.abs(diff),
                  },
                },
              });
            }
          }
        } else {
          const oldQty = currentItem.quantity;
          const newQty = item.quantity;

          if (order.status === 'PENDING' || order.status === 'PAYMENT_PROCESSING') {
            if (oldVariant) {
              await tx.productVariant.update({
                where: {
                  id: oldVariant.id,
                },
                data: {
                  reservedStock: {
                    decrement: oldQty,
                  },
                },
              });
            }

            await tx.productVariant.update({
              where: {
                id: newVariant.id,
              },
              data: {
                reservedStock: {
                  increment: newQty,
                },
              },
            });
          }

          if (order.status === 'PAID') {
            if (oldVariant) {
              await tx.productVariant.update({
                where: {
                  id: oldVariant.id,
                },
                data: {
                  stock: {
                    increment: oldQty,
                  },
                },
              });
            }

            await tx.productVariant.update({
              where: {
                id: newVariant.id,
              },
              data: {
                stock: {
                  decrement: newQty,
                },
              },
            });
          }
        }

        /* =========================
           UPDATE ORDER ITEM
        ========================= */

        await tx.orderItem.update({
          where: {
            id: currentItem.id,
          },

          data: {
            variantId: newVariant.id,

            size: newVariant.size,

            color: newVariant.color,

            quantity: item.quantity,
          },
        });
      }
    }

    const updatedItems = await tx.orderItem.findMany({
      where: {
        orderId,
      },
    });

    const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const refundAmount = oldTotal - newTotal;

    await tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        totalAmount: newTotal,
      },
    });

    /* =========================
   PAID ORDER ADJUSTMENT
========================= */

    if (order.status === 'PAID' && refundAmount > 0) {
      const stripeRefund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId!,
        amount: refundAmount,
      });

      await tx.refund.create({
        data: {
          orderId: order.id,
          amount: refundAmount,
          currency: order.currency,

          stripeRefundId: stripeRefund.id,

          type: 'ORDER_ADJUSTMENT',

          status: 'SUCCEEDED',

          note: 'Automatic refund generated from admin order adjustment',
        },
      });
    }

    /* =========================
       TIMELINE
    ========================= */

    if (order.status === 'PAID' && refundAmount > 0) {
      console.log(`💰 Auto refund required: ${refundAmount}`);
    }

    await tx.orderEvent.create({
      data: {
        orderId,

        type: order.status === 'PAID' && refundAmount > 0 ? 'ORDER_ADJUSTED' : 'ORDER_UPDATED',

        message:
          order.status === 'PAID' && refundAmount > 0
            ? `Automatic refund issued: €${(refundAmount / 100).toFixed(2)}`
            : 'Order edited by admin',
      },
    });

    getIO().emit('orderUpdated', {
      orderId,
    });

    return updatedOrder;
  });
}
