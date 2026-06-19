import { Response } from "express";
import { AuthRequest } from "@/common/middleware/auth.middleware";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.service";

export async function getWishlistController(
  req: AuthRequest,
  res: Response,
) {
  const items = await getWishlist(req.user!.id);

  res.json(items);
}

export async function addToWishlistController(
  req: AuthRequest,
  res: Response,
) {
  const productId =
    typeof req.params.productId === "string"
      ? req.params.productId
      : req.params.productId?.[0];

  if (!productId) {
    return res.status(400).json({
      error: "Product ID required",
    });
  }

  await addToWishlist(
    req.user!.id,
    productId,
  );

  res.json({ success: true });
}

export async function removeFromWishlistController(
  req: AuthRequest,
  res: Response,
) {
  const productId =
    typeof req.params.productId === "string"
      ? req.params.productId
      : req.params.productId?.[0];

  if (!productId) {
    return res.status(400).json({
      error: "Product ID required",
    });
  }

  await removeFromWishlist(
    req.user!.id,
    productId,
  );

  res.json({ success: true });
}