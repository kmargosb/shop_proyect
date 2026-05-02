import { Response } from "express";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { CheckoutService } from "./checkout.service";

export const checkoutController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await CheckoutService.checkout({
      ...req.body,
      userId: req.user?.id,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
};
