import { Router } from "express"
import upload from "../middleware/upload.middleware"
import * as controller from "../controllers/product.controller"
import { validate } from "../middleware/validate"
import { createProductSchema, updateProductSchema } from "../validations/product.schema"
import { protect, adminOnly } from "../middleware/auth.middleware"

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} from "../controllers/product.controller"

const router = Router()

router.get("/", getProducts)
router.post("/", protect, adminOnly, upload.array("images"), createProduct)
router.put("/:id", protect, adminOnly, upload.array("images"), updateProduct)
router.delete("/:id", protect, adminOnly, deleteProduct)

export default router