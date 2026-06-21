import { Router } from "express";
import { attachUserIfExists } from "@/common/middleware/auth.middleware";
import { trackAnalyticsEventController } from "./analytics.controller";

const router = Router();

router.post("/track", attachUserIfExists, trackAnalyticsEventController);

export default router;