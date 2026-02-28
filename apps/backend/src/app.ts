import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import orderRoutes from "./modules/orders/order.routes";
import { errorHandler } from "./common/middleware/error.middleware";
import invoiceRoutes from "@/modules/invoices/invoice.routes";

const app = express();

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

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/invoices", invoiceRoutes);

app.use(errorHandler);

export default app;