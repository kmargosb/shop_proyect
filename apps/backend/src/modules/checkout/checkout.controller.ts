import { Request, Response } from "express";
import { CheckoutService } from "./checkout.service";

export const checkoutController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await CheckoutService.checkout({
      cartId: req.params.cartId, // 🔥 CLAVE
      method: "CARD",
      ...req.body,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};