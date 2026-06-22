import { Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { trackEvent, getFunnelAnalytics, getTopProductsAnalytics, getAnalyticsInsights } from "./analytics.service";


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

export const getFunnelAnalyticsController =
  asyncHandler(async (_req, res) => {
    const data = await getFunnelAnalytics();

    res.json(data);
  });

  export const getTopProductsAnalyticsController =
  asyncHandler(async (_req, res) => {
    const data = await getTopProductsAnalytics();

    res.json(data);
  });

  export const getAnalyticsInsightsController =
  asyncHandler(async (_req, res) => {
    const data = await getAnalyticsInsights();

    res.json(data);
  });