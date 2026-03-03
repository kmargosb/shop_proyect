import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
  createOrderController,
  getOrdersController,
  updateOrderStatusController,
  downloadOrderInvoice,
  getPublicOrderController,
  downloadPublicInvoice
} from "./order.controller";

const router = Router();

/* ===============================
   PUBLIC ROUTES (SIEMPRE ARRIBA)
================================= */

// Public invoice (más específica)
router.get("/public/:id/invoice", downloadPublicInvoice);

// Public order
router.get("/public/:id", getPublicOrderController);

/* ===============================
   ADMIN / PRIVATE ROUTES
================================= */

// Guest checkout
router.post("/", createOrderController);

// Admin list
router.get("/", protect, adminOnly, getOrdersController);

// Admin update
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

// Admin invoice (protegida)
router.get("/:id/invoice", protect, downloadOrderInvoice);

export default router;