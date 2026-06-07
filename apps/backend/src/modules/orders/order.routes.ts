import { Router } from "express";
import {
  protect,
  adminOnly,
  attachUserIfExists,
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
  cancelOrderController,
  getAdminOrderByIdController,
  submitHelpRequestController,
  updateOrderAdminController,
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
   ADMIN ROUTES (🔥 ANTES DE :id)
================================= */

// Activity feed
router.get("/activity-feed", protect, adminOnly, getActivityFeedController);

// Analytics dashboard
router.get("/analytics", protect, adminOnly, getOrderAnalytics);

// Filter Orders
router.get("/search", protect, adminOnly, searchOrdersController);

// Admin list
router.get("/", protect, adminOnly, getOrdersController);

router.get("/admin/:id", protect, adminOnly, getAdminOrderByIdController);

// Timeline Orders
router.get("/:id/timeline", protect, adminOnly, getOrderTimelineController);

// Reenviar email
router.post("/:id/resend-email", protect, adminOnly, resendOrderEmailController);

router.patch("/:id/admin-edit", protect, adminOnly, updateOrderAdminController);

// Help email
router.post("/:id/help-request", submitHelpRequestController);

// Cambiar estado
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

// Cancelar orden
router.post("/:id/cancel", protect, adminOnly, cancelOrderController);

// Descargar invoice admin
router.get("/:id/invoice", protect, adminOnly, downloadOrderInvoice);

/* ===============================
   USER ROUTES
================================= */

// Get my orders
router.get("/me", protect, getMyOrdersController);

// Get my order by id
router.get("/:id/me", protect, getMyOrderByIdController);


/* ===============================
   🔥 UNIVERSAL ORDER ROUTE (SIEMPRE AL FINAL)
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

export default router;
