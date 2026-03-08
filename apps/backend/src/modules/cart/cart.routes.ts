import { Router } from "express"
import {
  getCartController,
  addItemController,
  createCartController,
} from "./cart.controller"

const router = Router()

router.get("/:cartId", getCartController)

router.post("/:cartId/items", addItemController)

router.post("/", createCartController)

export default router