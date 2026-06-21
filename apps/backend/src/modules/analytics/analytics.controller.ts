import { Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { trackEvent } from "./analytics.service";

export const trackAnalyticsEventController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId, event, metadata } = req.body;

    await trackEvent({
      userId: req.user?.id,
      productId,
      event,
      metadata,
    });

    res.json({
      success: true,
    });
  },
);