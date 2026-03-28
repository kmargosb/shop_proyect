import { Router } from "express"

import {
  createCartController,
  getCartController,
  addItemController,
  removeItemController,
  mergeCartController,
  checkoutCartController,
  getCartTotalsController,
} from "./cart.controller"
import { protect } from "@/common/middleware/auth.middleware";

const router = Router()

router.post("/", createCartController)

router.get("/:cartId", getCartController)

router.post("/:cartId/items", addItemController)

router.delete("/items/:itemId", removeItemController)

router.get("/:cartId/totals", getCartTotalsController)

router.post("/merge", mergeCartController)

// router.post("/:cartId/checkout", checkoutCartController)

router.post("/:cartId/checkout", protect, checkoutCartController);



export default router