import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { getCustomerOrdersController } from "./customer.controller";
import { getCustomerAnalyticsController } from "./customer.controller";

const router = Router();

/* ===============================
   CUSTOMER ADMIN ROUTES
================================= */

router.get("/:email/orders", protect, adminOnly, getCustomerOrdersController);

router.get("/:email/analytics", protect, adminOnly, getCustomerAnalyticsController);

export default router;