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
  getOrderTimelineController
} from "./order.controller";

import { getOrderAnalytics } from "@/modules/orders/order.analytics.controller";

const router = Router();

/* ===============================
   PUBLIC ROUTES (SIEMPRE ARRIBA)
================================= */

// Public invoice
router.get("/public/:id/invoice", downloadPublicInvoice);

// Public order page
router.get("/public/:id", getPublicOrderController);

// Guest checkout
router.post("/", createOrderController);

/* ===============================
   ADMIN ROUTES
================================= */

// Analytics dashboard
router.get("/analytics", protect, adminOnly, getOrderAnalytics);

// Admin list
router.get("/", protect, adminOnly, getOrdersController);

// Timeline Orders
router.get("/:id/timeline", protect, adminOnly, getOrderTimelineController);

// Reenviar email
router.post("/:id/resend-email", protect, adminOnly, resendOrderEmailController);

// Cambiar estado
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

// Descargar invoice admin
router.get("/:id/invoice", protect, adminOnly, downloadOrderInvoice);

export default router;