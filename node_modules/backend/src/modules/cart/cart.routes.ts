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

const router = Router()

router.post("/", createCartController)

router.get("/:cartId", getCartController)

router.post("/:cartId/items", addItemController)

router.delete("/items/:itemId", removeItemController)

router.get("/:cartId/totals", getCartTotalsController)

router.post("/merge", mergeCartController)

router.post("/:cartId/checkout", checkoutCartController)



export default router