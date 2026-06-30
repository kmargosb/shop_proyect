import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendOrderConfirmationEmail } from '@/modules/email/sendOrderEmail';
import { PaymentSessionService } from '@/modules/payment-sessions/payment-session.service';
import { InventoryService } from '@/modules/inventory/inventory.service';
import { getIO } from '@/lib/socket';

/* =========================================================
   UTIL
========================================================= */

async function findOrderFromPaymentIntent(paymentIntent: any) {
  let order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { invoice: true },
  });

  if (!order && paymentIntent.metadata?.orderId) {
    order = await prisma.order.findUnique({
      where: { id: paymentIntent.metadata.orderId },
      include: { invoice: true },
    });
  }

  return order;
}

/* =========================================================
   PAYMENT SUCCEEDED
========================================================= */

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('✅ handlePaymentSucceeded()');
  console.log('PaymentIntent:', paymentIntent.id);

  const order = await findOrderFromPaymentIntent(paymentIntent);

  console.log('Order found:', order?.id);
  console.log('Current status:', order?.status);

  if (!order) {
    console.error('⚠ Order not linked to PaymentIntent:', paymentIntent.id);
    return;
  }
  if (!['PENDING', 'PAYMENT_PROCESSING'].includes(order.status)) {
    console.error(`❌ Payment received for invalid order status: ${order.status}`, order.id);

    return;
  }

  if (order.totalAmount !== paymentIntent.amount || order.currency !== paymentIntent.currency) {
    console.error('❌ Amount mismatch detected.');
    return;
  }

  /* =========================
     PROCESS PAYMENT (ONCE)
  ========================= */

  if (order.status !== 'PAID') {
    await InventoryService.validateReservation(order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    console.log('✅ ORDER UPDATED TO PAID');

    await prisma.analyticsEvent.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        event: 'PURCHASE_COMPLETED',
      },
    });

    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
      },
    });

    for (const item of orderItems) {
      await prisma.analyticsEvent.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          productId: item.productId,
          event: 'PRODUCT_PURCHASED',
        },
      });
    }

    await InventoryService.confirmReservation(order.id);

    console.log('✅ INVENTORY CONFIRMED');

    console.log('📡 EMITTING SOCKETS');

    getIO().emit('orderUpdated', {
      orderId: order.id,
    });

    getIO().emit('orderPaid', {
      orderId: order.id,
    });

    await prisma.orderTransaction.create({
      data: {
        orderId: order.id,
        type: 'PAYMENT',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PAYMENT_SUCCEEDED',
        message: 'Payment confirmed',
      },
    });

    console.log('✅ PAYMENT EVENT CREATED');

    await PaymentSessionService.markSessionCompleted(paymentIntent.id);

    console.log('✅ Order marked as PAID:', order.id);

    getIO().emit('dashboard:update', {
      type: 'PAYMENT_SUCCEEDED',
      orderId: order.id,
    });
  } else {
    console.log('⚠ Duplicate payment webhook:', paymentIntent.id);
  }

  /* =========================
     ENSURE INVOICE EXISTS
  ========================= */

  const existingInvoice = await prisma.invoice.findUnique({
    where: { orderId: order.id },
  });

  if (!existingInvoice) {
    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: `INV-${Date.now()}`,
        totalAmount: order.totalAmount,
        customerEmail: order.email,
      },
    });

    console.log('🧾 Invoice created.');
  }

  /* =========================
     SEND EMAIL (SAFE)
  ========================= */

  const emailEvent = await prisma.orderEvent.findFirst({
    where: {
      orderId: order.id,
      type: 'ORDER_UPDATED',
      message: 'Confirmation email sent',
    },
  });

  if (!emailEvent) {
    await sendOrderConfirmationEmail(order.id);

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'ORDER_UPDATED',
        message: 'Confirmation email sent',
      },
    });

    console.log('📧 Confirmation email sent.');
  }
}

/* =========================================================
   PAYMENT FAILED
========================================================= */

async function handlePaymentFailed(paymentIntent: any) {
  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (!order) return;

  if (order.status === 'PAID') return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'FAILED' },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'PAYMENT_FAILED',
      message: 'Payment failed',
    },
  });

  await InventoryService.releaseReservation(order.id);

  await PaymentSessionService.markSessionFailed(paymentIntent.id);

  console.log('❌ Order marked as FAILED:', order.id);

  getIO().emit('dashboard:update', {
    type: 'PAYMENT_FAILED',
    orderId: order.id,
  });
}

/* =========================================================
   REFUND CREATED
========================================================= */

async function handleRefundCreated(refund: any) {
  const existingRefund = await prisma.refund.findUnique({
    where: { stripeRefundId: refund.id },
  });

  if (existingRefund) {
    console.log('⚠ Refund already exists:', refund.id);
    return;
  }

  const order = await prisma.order.findFirst({
    where: {
      stripePaymentIntentId: refund.payment_intent,
    },
  });

  if (!order) return;

  await prisma.refund.create({
    data: {
      orderId: order.id,
      stripeRefundId: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: 'PENDING_REVIEW',
    },
  });

  await prisma.orderTransaction.create({
    data: {
      orderId: order.id,
      type: 'REFUND',
      amount: refund.amount,
      currency: refund.currency,
      stripeRefundId: refund.id,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'REFUND_CREATED',
      message: 'Refund created',
    },
  });

  console.log('💸 Refund created:', refund.id);

  getIO().emit('dashboard:update', {
    type: 'REFUND_CREATED',
  });
}

/* =========================================================
   REFUND UPDATED
========================================================= */

async function handleRefundUpdated(refund: any) {
  const dbRefund = await prisma.refund.findUnique({
    where: { stripeRefundId: refund.id },
    include: { order: true },
  });

  if (!dbRefund) return;

  if (dbRefund.status === 'SUCCEEDED') {
    console.log('⚠ Refund already processed:', refund.id);
    return;
  }

  const status =
    refund.status === 'succeeded'
      ? 'SUCCEEDED'
      : refund.status === 'failed'
        ? 'FAILED'
        : 'PENDING_REVIEW';

  await prisma.refund.update({
    where: { stripeRefundId: refund.id },
    data: { status },
  });

  if (status !== 'SUCCEEDED') return;

  const order = await prisma.order.findUnique({
    where: { id: dbRefund.orderId },
  });

  if (!order) return;

  /* =========================
   RESTORE STOCK
========================= */

  const { InventoryCache } = await import('@/modules/inventory/inventory.cache');

  const refundItems = await prisma.refundItem.findMany({
    where: { refundId: dbRefund.id },
    include: { orderItem: true },
  });

  if (refundItems.length > 0) {
    for (const item of refundItems) {
      if (item.orderItem.variantId) {
        await prisma.productVariant.update({
          where: {
            id: item.orderItem.variantId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      /* sync redis */

      try {
        if (item.orderItem.variantId) {
          await InventoryCache.incrementStock(item.orderItem.variantId, item.quantity);
        }
      } catch (error) {
        console.error('Redis stock restore error:', error);
      }
    }
  } else {
    /* fallback: full order refund */

    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    for (const item of orderItems) {
      if (item.variantId) {
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

      /* sync redis */

      try {
        if (item.variantId) {
          await InventoryCache.incrementStock(item.variantId, item.quantity);
        }
      } catch (error) {
        console.error('Redis stock restore error:', error);
      }
    }
  }

  /* =========================
   CALCULATE ORDER STATUS
========================= */

  const refundAggregate = await prisma.refund.aggregate({
    where: {
      orderId: dbRefund.orderId,
      status: 'SUCCEEDED',
    },
    _sum: {
      amount: true,
    },
  });

  const totalRefunded = refundAggregate._sum.amount ?? 0;

  /* =========================
   ORDER ADJUSTMENT REFUND
========================= */

  const orderAdjustedEvent = await prisma.orderEvent.findFirst({
    where: {
      orderId: order.id,
      type: 'ORDER_ADJUSTED',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (orderAdjustedEvent) {
    console.log('⚠️ Order adjustment refund detected');

    return;
  }

  /* =========================
   NORMAL CUSTOMER REFUND
========================= */

  const newStatus = totalRefunded >= order.totalAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: newStatus,
    },
  });

  await prisma.orderEvent.create({
    data: {
      orderId: order.id,
      type: 'REFUND_COMPLETED',
      message: 'Refund completed',
    },
  });

  console.log(`💰 Refund processed: ${order.id} → ${newStatus}`);

  getIO().emit('dashboard:update', {
    type: 'REFUND_COMPLETED',
    orderId: order.id,
  });
}

/* =========================================================
   MAIN WEBHOOK
========================================================= */

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    console.log('========== STRIPE WEBHOOK ==========');
    console.log('Event:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed.');
    return res.status(400).send('Webhook Error');
  }

  try {
    /* =========================
       IDEMPOTENCY
    ========================= */

    const existingEvent = await prisma.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      console.log('⚠ Duplicate webhook ignored:', event.id);
      return res.json({ received: true });
    }

    await prisma.stripeWebhookEvent.create({
      data: { id: event.id },
    });

    /* =========================
       HANDLE EVENTS
    ========================= */

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'refund.created':
        await handleRefundCreated(event.data.object);
        break;

      case 'refund.updated':
        await handleRefundUpdated(event.data.object);
        break;

      case 'payment_intent.canceled':
        console.log('🚫 PaymentIntent cancelled:', event.data.object.id);
        break;

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    return res.json({ received: true });

    console.log('========== WEBHOOK END ==========');
  } catch (err) {
    console.error('🔥 Stripe webhook error:', err);
    return res.json({ received: true });
  }
};
