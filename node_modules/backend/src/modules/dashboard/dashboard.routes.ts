import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { getDashboardMetricsController } from "./dashboard.metrics.controller";
import { getTopProductsController } from "./dashboard.top-products.controller";
import { getRefundRateController } from "./dashboard.refund-rate.controller";
import { getRevenueChartController } from "./dashboard.revenue-chart.controller";
import { getTopCustomersController } from "./dashboard.top-customers.controller";
import { getRevenueGrowthController } from "./dashboard.revenue-growth.controller";
import { getSalesByCountryController } from "./dashboard.sales-by-country.controller";
import { getAlertsController } from "./dashboard.alerts.controller";

const router = Router();

/* ===============================
   ADMIN DASHBOARD
================================= */

router.get("/metrics", protect, adminOnly, getDashboardMetricsController);

router.get("/top-products", protect, adminOnly, getTopProductsController);

router.get("/refund-rate", protect, adminOnly, getRefundRateController);

router.get("/revenue-chart", protect, adminOnly, getRevenueChartController);

router.get("/top-customers", protect, adminOnly, getTopCustomersController);

router.get("/revenue-growth", protect, adminOnly, getRevenueGrowthController);

router.get("/sales-by-country", protect, adminOnly, getSalesByCountryController);

router.get("/alerts", protect, adminOnly, getAlertsController);

export default router;
