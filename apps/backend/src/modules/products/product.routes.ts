import { Router } from 'express';
import upload from '@/common/middleware/upload.middleware';
import { protect, adminOnly } from '@/common/middleware/auth.middleware';
import { getInventoryAlertsController } from '@/modules/products/product.inventory.controller';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
  getProductsByBrand,
  getProductsFiltered,
} from './product.controller';

const router = Router();

/* =========================================================
   PUBLIC ROUTES
========================================================= */

/* 🔥 FILTERED (IMPORTANTE: arriba) */
router.get('/search', getProductsFiltered);

/* 🔥 BRAND */
router.get('/brand/:brand', getProductsByBrand);

/* ALL */
router.get('/', getProducts);

/* RELATED */
router.get('/:id/related', getRelatedProducts);

/* ONE */
router.get('/:id', getProduct);

/* =========================================================
   ADMIN ROUTES
========================================================= */

router.get('/inventory-alerts', protect, adminOnly, getInventoryAlertsController);

router.post('/', protect, adminOnly, upload.array('images'), createProduct);

router.put('/:id', protect, adminOnly, upload.array('images'), updateProduct);

router.delete('/:id', protect, adminOnly, deleteProduct);

router.patch('/:id/restore', protect, adminOnly, restoreProduct);

export default router;
