import { prisma } from '@/lib/prisma';
import { Prisma, PaymentMethod } from '@prisma/client';
import { getProviderFromMethod } from '@/modules/payment/payment-method.mapper';
import { getPaymentProvider } from '@/modules/payment/payment.factory';
import { stripe } from '@/lib/stripe';

export const PaymentSessionService = {
  async createSession(orderId: string, method: PaymentMethod, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!['PENDING', 'PAYMENT_PROCESSING'].includes(order.status)) {
      throw new Error(`Order cannot be paid in status ${order.status}`);
    }

    const existingSession = await db.paymentSession.findFirst({
      where: {
        orderId,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
    });

    if (existingSession) {
      console.log('♻️ Reusing existing payment session:', existingSession.id);

      return existingSession;
    }

    const provider = getProviderFromMethod(method);

    const session = await db.paymentSession.create({
      data: {
        orderId: order.id,
        provider,
        method,
        status: 'PENDING',
      },
    });

    return session;
  },

  async createPaymentIntent(sessionId: string) {
    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        order: true,
      },
    });

    if (!session) {
      throw new Error('Payment session not found');
    }
    if (!['PENDING', 'PAYMENT_PROCESSING'].includes(session.order.status)) {
      throw new Error(`Order cannot be paid in status ${session.order.status}`);
    }

    if (session.status === 'COMPLETED') {
      throw new Error('Payment session already completed');
    }
    if (session.paymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(session.paymentIntentId);

        if (
          existingIntent.status !== 'canceled' &&
          existingIntent.status !== 'succeeded' &&
          existingIntent.status !== 'processing'
        ) {
          console.log('♻️ Reusing session PaymentIntent:', existingIntent.id);

          return existingIntent;
        }
      } catch {
        console.warn('⚠️ Existing PaymentIntent could not be recovered, creating a new one.');
      }
    }
    const provider = getPaymentProvider(session.provider);

    try {
      const paymentIntent = await provider.createPaymentIntent(
        session.order.totalAmount,
        session.order.currency,
        session.order.id,
      );

      await prisma.$transaction([
        prisma.paymentSession.update({
          where: { id: session.id },
          data: {
            paymentIntentId: paymentIntent.id,
            status: 'ACTIVE',
          },
        }),

        prisma.order.update({
          where: { id: session.order.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
            paymentProvider: session.provider,
            paymentMethod: session.method,
            status: 'PAYMENT_PROCESSING',
          },
        }),
      ]);

      return paymentIntent;
    } catch (error) {
      console.error('❌ Failed to create PaymentIntent:', error);

      throw new Error('Unable to initialize payment');
    }
  },

  async markSessionCompleted(paymentIntentId: string) {
    const session = await prisma.paymentSession.findFirst({
      where: {
        paymentIntentId,
      },
    });

    if (!session) {
      return;
    }

    await prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
      },
    });
  },

  async markSessionFailed(paymentIntentId: string) {
    const session = await prisma.paymentSession.findFirst({
      where: {
        paymentIntentId,
      },
    });

    if (!session) {
      return;
    }

    await prisma.paymentSession.update({
      where: { id: session.id },
      data: {
        status: 'FAILED',
      },
    });
  },
};
