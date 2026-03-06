import { Router } from "express"
import upload from "@/common/middleware/upload.middleware"
import * as controller from "./product.controller"
import { validate } from "@/common/middleware/validate.middleware"
import { createProductSchema, updateProductSchema } from "./product.schema"
import { getInventoryAlertsController } from "@/modules/products/product.inventory.controller";
import { protect, adminOnly } from "@/common/middleware/auth.middleware"

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} from "./product.controller"

const router = Router()

router.get("/", getProducts)
router.post("/", protect, adminOnly, upload.array("images"), createProduct)
router.put("/:id", protect, adminOnly, upload.array("images"), updateProduct)
router.delete("/:id", protect, adminOnly, deleteProduct)

//Alert LowStock
router.get("/inventory-alerts", protect, adminOnly, getInventoryAlertsController);

export default router