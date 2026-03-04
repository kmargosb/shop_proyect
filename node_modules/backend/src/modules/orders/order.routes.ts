import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
  createOrderController,
  getOrdersController,
  updateOrderStatusController,
  downloadOrderInvoice,
  getPublicOrderController,
  downloadPublicInvoice,
  resendOrderEmailController,
} from "./order.controller";
import {getOrderAnalytics} from "@/modules/orders/order.analytics.controller"

const router = Router();

/* ===============================
   PUBLIC ROUTES (SIEMPRE ARRIBA)
================================= */

// Public invoice (más específica)
router.get("/public/:id/invoice", downloadPublicInvoice);

// Public order
router.get("/public/:id", getPublicOrderController);

// Guest checkout
router.post("/", createOrderController);

/* ===============================
   ADMIN / PRIVATE ROUTES
================================= */

// Admin list
router.get("/", protect, adminOnly, getOrdersController);

// Admin update
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

// Reenviar email
router.post(
  "/:id/resend-email",
  protect,
  adminOnly,
  resendOrderEmailController,
);

// Admin invoice (protegida)
router.get("/:id/invoice", protect, downloadOrderInvoice);

//Analitycs dashboard
router.get("/analytics", protect, adminOnly, getOrderAnalytics);

export default router;
