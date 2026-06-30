import { CartService } from '@/modules/cart/cart.service';
import { PaymentSessionService } from '@/modules/payment-sessions/payment-session.service';
import { prisma } from '@/lib/prisma';
import { createOrderWithTx } from '@/modules/orders/order.service';

type CheckoutInput = {
  cartId: string;
  method: string;

  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export const CheckoutService = {
  async checkout(data: CheckoutInput) {
    const { cartId, method, userId, ...checkoutData } = data;

    await CartService.syncCartInventory(cartId);

    const { order, totals } = await prisma.$transaction(
      async (tx) => {
        await CartService.lockCartTx(tx, cartId);

        const cart = await CartService.validateCartTx(tx, cartId);

        const totals = CartService.calculateTotalsFromCart(cart);

        const order = await createOrderWithTx(tx, {
          ...checkoutData,
          userId,
          items: cart.items.map((item: (typeof cart.items)[number]) => ({
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,

            productName: item.product.name,
            productPrice: item.product.price,

            sku: item.variant?.sku ?? null,
            size: item.variant?.size,
            color: item.variant?.color,
          })),
        });

        await CartService.finishCartTx(tx, cartId);

        return {
          order,
          totals,
        };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    await prisma.analyticsEvent.create({
      data: {
        userId,
        productId: null,
        orderId: order.id,
        event: 'CHECKOUT_STARTED',
      },
    });

    /* =========================
       CREATE PAYMENT SESSION
    ========================= */

    const session = await PaymentSessionService.createSession(order.id, method as any);

    const paymentIntent = await PaymentSessionService.createPaymentIntent(session.id);

    return {
      orderId: order.id,

      totals,

      payment: {
        sessionId: session.id,
        clientSecret: paymentIntent.client_secret,
      },
    };
  },
};
