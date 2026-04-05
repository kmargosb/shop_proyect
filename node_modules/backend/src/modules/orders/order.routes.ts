import { Router } from "express";
import {
  protect,
  adminOnly,
  attachUserIfExists, // 🔥 usamos el tuyo (perfecto)
} from "@/common/middleware/auth.middleware";

import {
  createOrderController,
  getOrdersController,
  updateOrderStatusController,
  downloadOrderInvoice,
  getPublicOrderController,
  downloadPublicInvoice,
  resendOrderEmailController,
  getOrderTimelineController,
  getMyOrdersController,
  getMyOrderByIdController,
  searchOrdersController,
} from "./order.controller";

import { getActivityFeedController } from "./order.activity.controller";
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
   USER ROUTES (🔥 ANTES DE :id)
================================= */

router.get("/me", protect, getMyOrdersController);

/* ===============================
   🔥 UNIVERSAL ORDER ROUTE (FIX REAL)
================================= */

router.get("/:id", attachUserIfExists, async (req, res, next) => {
  try {
    if ((req as any).user) {
      return getMyOrderByIdController(req as any, res, next);
    }

    return getPublicOrderController(req, res, next);
  } catch (err) {
    next(err);
  }
});

/* ===============================
   ADMIN ROUTES
================================= */

// Analytics dashboard
router.get("/analytics", protect, adminOnly, getOrderAnalytics);

// Filter Orders
router.get("/search", protect, adminOnly, searchOrdersController);

// USER ROUTES
router.get("/me", protect, getMyOrdersController);

// Admin list
router.get("/", protect, adminOnly, getOrdersController);

// Activity feed
router.get("/activity-feed", protect, adminOnly, getActivityFeedController);

// Timeline Orders
router.get("/:id/timeline", protect, adminOnly, getOrderTimelineController);

// Reenviar email
router.post(
  "/:id/resend-email",
  protect,
  adminOnly,
  resendOrderEmailController,
);

// Cambiar estado
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

// Descargar invoice admin
router.get("/:id/invoice", protect, adminOnly, downloadOrderInvoice);

// 🔥 ESTA LA DEJAMOS (NO ROMPE NADA)
router.get("/:id/me", protect, getMyOrderByIdController);

export default router;
