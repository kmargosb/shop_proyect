import { Router } from "express"
import { createOrderController, getOrdersController, updateOrderStatusController } from "../controllers/order.controller"
import { protect, adminOnly } from "../middleware/auth.middleware"

const router = Router()

// Guest checkout
router.post("/", createOrderController)

// Admin routes
router.get("/", protect, adminOnly, getOrdersController)
router.patch("/:id", protect, adminOnly, updateOrderStatusController)

export default router