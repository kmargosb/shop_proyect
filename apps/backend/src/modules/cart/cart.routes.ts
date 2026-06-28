import { Router } from 'express';

import {
  createCartController,
  getCartController,
  addItemController,
  removeItemController,
  mergeCartController,
  checkoutCartController,
  getCartTotalsController,
  getActiveCartController,
} from './cart.controller';

import { attachUserIfExists } from '@/common/middleware/auth.middleware'; // 🔥 IMPORTANTE

const router = Router();

router.post('/', createCartController);

router.get('/', attachUserIfExists, getActiveCartController);

router.get('/:cartId', getCartController);

router.post('/:cartId/items', addItemController);

router.delete('/items/:itemId', removeItemController);

router.get('/:cartId/totals', getCartTotalsController);

router.post('/merge', mergeCartController);

router.post('/:cartId/checkout', attachUserIfExists, checkoutCartController);

export default router;
