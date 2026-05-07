import { CartService } from "@/modules/cart/cart.service";
import { PaymentSessionService } from "@/modules/payment-sessions/payment-session.service";

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

   /* =========================
      SYNC INVENTORY
   ========================= */

    await CartService.syncCartInventory(cartId);

   /* =========================
      VALIDATE CART
   ========================= */

    await CartService.validateCart(cartId);

   /* =========================
      CALCULATE TOTALS
   ========================= */

    const totals = await CartService.calculateTotals(cartId);

    /* =========================
       CREATE ORDER
    ========================= */

    const order = await CartService.convertCartToOrder(cartId, {
      ...checkoutData,
      userId,
    });

    /* =========================
       CREATE PAYMENT SESSION
    ========================= */

    const session = await PaymentSessionService.createSession(
      order.id,
      method as any,
    );

    const paymentIntent = await PaymentSessionService.createPaymentIntent(
      session.id,
    );

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
