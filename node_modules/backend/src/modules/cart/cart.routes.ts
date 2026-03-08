import { Router } from "express"

import {
  createCartController,
  getCartController,
  addItemController,
  removeItemController,
  getTotalsController,
  mergeCartController
} from "./cart.controller"

const router = Router()

router.post("/", createCartController)

router.get("/:cartId", getCartController)

router.post("/:cartId/items", addItemController)

router.delete("/items/:cartItemId", removeItemController)

router.get("/:cartId/totals", getTotalsController)

router.post("/merge", mergeCartController)

export default router