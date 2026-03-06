import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import invoiceRoutes from "@/modules/invoices/invoice.routes";
import paymentRouter from "./modules/payment/payment.router";
import { stripeWebhook } from "./modules/payment/webhook.controller";
import { errorHandler } from "./common/middleware/error.middleware";
import refundRoutes from "./modules/refunds/refund.routes";
import dashboardRoutes from "@/modules/dashboard/dashboard.routes";
import customerRoutes from "@/modules/customers/customer.routes";

const app = express();

/**
 * ✅ STRIPE WEBHOOK (ANTES DE TODO)
 */
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.post("/api/payments/webhook", stripeWebhook);

/**
 * ✅ NORMAL MIDDLEWARE
 */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (_, res) => {
  res.json({
    status: "OK",
    message: "Backend funcionando correctamente",
  });
});

/**
 * ROUTES
 */
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/refunds", refundRoutes);
app.use("/api/payments", paymentRouter);
app.use("/invoices", invoiceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/customers", customerRoutes);

app.use(errorHandler);

export default app;