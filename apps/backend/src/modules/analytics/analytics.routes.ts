import { Router } from "express";
import { attachUserIfExists } from "@/common/middleware/auth.middleware";
import {
  getAnalyticsInsightsController,
  getFunnelAnalyticsController,
  getTopProductsAnalyticsController,
  trackAnalyticsEventController,
} from "./analytics.controller";

const router = Router();

router.post("/track", attachUserIfExists, trackAnalyticsEventController);
router.get("/funnel", getFunnelAnalyticsController);
router.get("/top-products", getTopProductsAnalyticsController);
router.get("/insights", getAnalyticsInsightsController);

export default router;
