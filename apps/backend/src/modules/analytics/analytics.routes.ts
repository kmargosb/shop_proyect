import { Router } from "express";
import { attachUserIfExists } from "@/common/middleware/auth.middleware";
import { getFunnelAnalyticsController, getTopProductsAnalyticsController, trackAnalyticsEventController } from "./analytics.controller";

const router = Router();

router.post("/track", attachUserIfExists, trackAnalyticsEventController);
router.get("/funnel", getFunnelAnalyticsController);
router.get("/top-products", getTopProductsAnalyticsController);

export default router;