import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { getDashboardMetricsController } from "./dashboard.metrics.controller";

const router = Router();

/* ===============================
   ADMIN DASHBOARD
================================= */

router.get("/metrics", protect, adminOnly, getDashboardMetricsController);

export default router;
