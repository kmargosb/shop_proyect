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
app.get('/google-test-2', async (_, res) => {
  const urls = [
    'https://www.googleapis.com/oauth2/v1/certs',
    'https://www.googleapis.com/oauth2/v3/certs',
    'https://oauth2.googleapis.com/tokeninfo?id_token=fake',
    'https://accounts.google.com/.well-known/openid-configuration',
  ];

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const r = await fetch(url);
        return {
          url,
          status: r.status,
        };
      } catch (e) {
        return {
          url,
          error: String(e),
        };
      }
    }),
  );

  res.json(results);
});

/* ERROR HANDLER */
app.use(errorHandler);

export default app;
