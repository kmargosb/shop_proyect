import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { getDashboardMetricsController } from "./dashboard.metrics.controller";
import { getTopProductsController } from "./dashboard.top-products.controller";

const router = Router();

/* ===============================
   ADMIN DASHBOARD
================================= */

router.get("/metrics", protect, adminOnly, getDashboardMetricsController);

router.get("/top-products", protect, adminOnly, getTopProductsController);

export default router;
