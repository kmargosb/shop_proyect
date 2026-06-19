import { Router } from "express";
import { protect } from "@/common/middleware/auth.middleware";

import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
} from "./wishlist.controller";

const router = Router();

router.use(protect);

router.get("/", getWishlistController);

router.post("/:productId", addToWishlistController);

router.delete("/:productId", removeFromWishlistController);

export default router;