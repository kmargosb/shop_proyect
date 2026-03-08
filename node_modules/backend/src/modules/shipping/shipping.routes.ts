import { Router } from "express"
import { protect, adminOnly } from "@/common/middleware/auth.middleware"

import {
  createShipmentController,
  updateShipmentStatusController,
  getShipmentController
} from "./shipping.controller"

const router = Router()

router.post("/", protect, adminOnly, createShipmentController)

router.patch("/:id/status", protect, adminOnly, updateShipmentStatusController)

router.get("/:orderId", protect, adminOnly, getShipmentController)

export default router