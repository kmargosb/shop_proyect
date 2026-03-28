import { Request, Response } from "express";
import { CheckoutService } from "@/modules/checkout/checkout.service";
import { CartService } from "./cart.service";
import { getStringParam } from "@/common/utils/request";

/* =========================================================
   CREATE CART
========================================================= */

export const createCartController = async (req: Request, res: Response) => {
  try {

    const userId = req.body?.userId;

    const cart = await CartService.getOrCreateCart(userId);

    res.json(cart);

  } catch (error) {

    console.error("Create cart error:", error);

    res.status(500).json({
      error: "Failed to create cart",
    });

  }
};


/* =========================================================
   GET CART
========================================================= */

export const getCartController = async (req: Request, res: Response) => {
  try {

    const cartId = getStringParam(req.params.cartId);

    if (!cartId) {
      return res.status(400).json({
        error: "Cart ID is required",
      });
    }

    const cart = await CartService.getCart(cartId);

    res.json(cart);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to get cart",
    });

  }
};


/* =========================================================
   GET CART TOTALS
========================================================= */

export const getCartTotalsController = async (req: Request, res: Response) => {

  const cartId = getStringParam(req.params.cartId);

  if (!cartId) {
    return res.status(400).json({
      error: "Cart ID is required",
    });
  }

  const totals = await CartService.calculateTotals(cartId);

  res.json(totals);

};


/* =========================================================
   ADD ITEM
========================================================= */

export const addItemController = async (req: Request, res: Response) => {

  const cartId = getStringParam(req.params.cartId);

  if (!cartId) {
    return res.status(400).json({
      error: "Cart ID is required",
    });
  }

  const { productId, quantity } = req.body;

  const cart = await CartService.addItem(cartId, productId, quantity);

  res.json(cart);

};


/* =========================================================
   REMOVE ITEM
========================================================= */

export const removeItemController = async (req: Request, res: Response) => {

  const itemId = getStringParam(req.params.itemId);

  if (!itemId) {
    return res.status(400).json({
      error: "Item ID is required",
    });
  }

  const item = await CartService.removeItem(itemId);

  res.json(item);

};


/* =========================================================
   MERGE CART
========================================================= */

export const mergeCartController = async (req: Request, res: Response) => {

  const { guestCartId, userId } = req.body;

  const cart = await CartService.mergeCart(guestCartId, userId);

  res.json(cart);

};


/* =========================================================
   CHECKOUT CART
========================================================= */

export const checkoutCartController = async (
  req: Request,
  res: Response
) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({
        error: "Cart ID is required",
      });
    }

    /* =========================
       CALL NEW CHECKOUT SERVICE
    ========================= */

    const result = await CheckoutService.checkout({
      cartId,
      method: "CARD",
      ...req.body,
      userId: (req as any).user?.id,
    });

    /* =========================
       RETURN CLEAN RESPONSE
    ========================= */

    return res.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      error: error.message || "Checkout failed",
    });
  }
};