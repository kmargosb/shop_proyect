import { CartService } from '@/modules/cart/cart.service';
import { PaymentSessionService } from '@/modules/payment-sessions/payment-session.service';
import { prisma } from '@/lib/prisma';
import { createOrderWithTx } from '@/modules/orders/order.service';
import type { CheckoutInput } from './types';

export const CheckoutService = {
  async checkout(data: CheckoutInput) {
    console.time('🛒 TOTAL CHECKOUT');

    const { cartId, method, userId, ...checkoutData } = data;

    console.time('1️⃣ Sync inventory');
    await CartService.syncCartInventory(cartId);
    console.timeEnd('1️⃣ Sync inventory');

    console.time('2️⃣ Database transaction');

    const { order, totals } = await prisma.$transaction(
      async (tx) => {
        console.time('2.1️⃣ Lock cart');
        await CartService.lockCartTx(tx, cartId);
        console.timeEnd('2.1️⃣ Lock cart');

        console.time('2.2️⃣ Validate cart');
        const cart = await CartService.validateCartTx(tx, cartId);
        console.timeEnd('2.2️⃣ Validate cart');

        console.time('2.3️⃣ Calculate totals');
        const totals = CartService.calculateTotalsFromCart(cart);
        console.timeEnd('2.3️⃣ Calculate totals');

        console.time('2.4️⃣ Create order');
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
        console.timeEnd('2.4️⃣ Create order');

        console.time('2.5️⃣ Finish cart');
        await CartService.finishCartTx(tx, cartId);
        console.timeEnd('2.5️⃣ Finish cart');

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

    console.timeEnd('2️⃣ Database transaction');

    console.time('3️⃣ Analytics');
    await prisma.analyticsEvent.create({
      data: {
        userId,
        productId: null,
        orderId: order.id,
        event: 'CHECKOUT_STARTED',
      },
    });
    console.timeEnd('3️⃣ Analytics');

    console.time('4️⃣ Create payment session');
    const session = await PaymentSessionService.createSession(order.id, method as any);
    console.timeEnd('4️⃣ Create payment session');

    console.time('5️⃣ Create PaymentIntent');
    const paymentIntent = await PaymentSessionService.createPaymentIntent(session.id);
    console.timeEnd('5️⃣ Create PaymentIntent');

    console.timeEnd('🛒 TOTAL CHECKOUT');

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
