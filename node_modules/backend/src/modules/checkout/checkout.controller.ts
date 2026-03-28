import { Request, Response } from "express";
import { CheckoutService } from "./checkout.service";

export const checkoutController = async (req: Request, res: Response) => {
  try {
    const result = await CheckoutService.checkout({
      ...req.body,
      userId: (req as any).user?.id, // 🔥 CLAVE
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};
