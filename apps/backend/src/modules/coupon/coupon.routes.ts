import { Router } from "express"
import { protect, adminOnly } from "@/common/middleware/auth.middleware"

import {
  applyCouponController,
  createCouponController,
  listCouponsController
} from "./coupon.controller"

const router = Router()

router.post("/apply", protect, applyCouponController)

router.post("/", protect, adminOnly, createCouponController)

router.get("/", protect, adminOnly, listCouponsController)

export default router