import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
  createOrderController,
  getOrdersController,
  updateOrderStatusController,
  downloadOrderInvoice,
  getPublicOrderController,
} from "./order.controller";

const router = Router();

// Guest checkout
router.post("/", createOrderController);

// Admin routes
router.get("/", protect, adminOnly, getOrdersController);
router.patch("/:id", protect, adminOnly, updateOrderStatusController);

//Invoice
router.get("/:id/invoice", protect, downloadOrderInvoice);

router.get("/public/:id", getPublicOrderController);

export default router;
