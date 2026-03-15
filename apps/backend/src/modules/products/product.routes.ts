import { Router } from "express";
import upload from "@/common/middleware/upload.middleware";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct
} from "./product.controller";
import { getInventoryAlertsController } from "@/modules/products/product.inventory.controller";

const router = Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

// obtener todos los productos
router.get("/", getProducts);

// obtener un producto por ID (product page)
router.get("/:id", getProduct);

/* =========================================================
   ADMIN ROUTES
========================================================= */

// crear producto
router.post("/", protect, adminOnly, upload.array("images"), createProduct);

// actualizar producto
router.put("/:id", protect, adminOnly, upload.array("images"), updateProduct);

// eliminar producto (soft delete)
router.delete("/:id", protect, adminOnly, deleteProduct);

// alertas de inventario bajo
router.get("/inventory-alerts", protect, adminOnly, getInventoryAlertsController);

export default router;