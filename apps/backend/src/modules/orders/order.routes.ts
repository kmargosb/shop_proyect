import { Router } from "express"
import { createOrderController, getOrdersController, updateOrderStatusController, downloadOrderInvoice } from "./order.controller"
import { protect, adminOnly } from "@/common/middleware/auth.middleware"

const router = Router()

// Guest checkout
router.post("/", createOrderController)

// Admin routes
router.get("/", protect, adminOnly, getOrdersController)
router.patch("/:id", protect, adminOnly, updateOrderStatusController)

//Invoice
router.get("/:id/invoice", protect, downloadOrderInvoice);

export default router