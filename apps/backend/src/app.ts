import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import orderRoutes from './modules/orders/order.routes';
import invoiceRoutes from '@/modules/invoices/invoice.routes';
import paymentRouter from './modules/payment/payment.router';
import { stripeWebhook } from './modules/payment/webhook.controller';
import { errorHandler } from './common/middleware/error.middleware';
import refundRoutes from './modules/refunds/refund.routes';
import dashboardRoutes from '@/modules/dashboard/dashboard.routes';
import customerRoutes from '@/modules/customers/customer.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import paymentSessionRoutes from '@/modules/payment-sessions/payment-session.routes';
import shippingRoutes from '@/modules/shipping/shipping.routes';
import couponRoutes from '@/modules/coupon/coupon.routes';
import cartRoutes from '@/modules/cart/cart.routes';
import checkoutRoutes from '@/modules/checkout/checkout.routes';
import brandRoutes from '@/modules/brands/brands.routes';
import { allowedOrigins } from '@/config/origins';
import wishlistRoutes from '@/modules/wishlist/wishlist.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app = express();

/* STRIPE WEBHOOK */
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.post('/api/payments/webhook', stripeWebhook);

/* GLOBAL MIDDLEWARE */
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

/* HEALTH CHECK */
app.get('/', (_, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
  });
});

/* ROUTES */
app.use('/auth', authRoutes);
app.use('/brands', brandRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/payment-sessions', paymentSessionRoutes);
app.use('/refunds', refundRoutes);
app.use('/api/payments', paymentRouter);
app.use('/invoices', invoiceRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/customers', customerRoutes);
app.use('/admin', adminRoutes);
app.use('/shipping', shippingRoutes);
app.use('/coupons', couponRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

/* HEALTH CHECK */
app.get('/', (_, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
  });
});

/* TEST GOOGLE */
app.get('/google-test', async (_, res) => {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/certs');

    const text = await r.text();

    res.json({
      status: r.status,
      ok: r.ok,
      first200: text.substring(0, 200),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

/* ERROR HANDLER */
app.use(errorHandler);

export default app;
