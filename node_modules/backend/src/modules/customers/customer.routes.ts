import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
   getCustomerOrdersController,
   getCustomerAnalyticsController,
   getCustomersController
} from "./customer.controller";

const router = Router();

/* ===============================
   CUSTOMER ADMIN ROUTES
================================= */

router.get("/:email/orders", protect, adminOnly, getCustomerOrdersController);

router.get("/:email/analytics", protect, adminOnly, getCustomerAnalyticsController);

router.get("/", protect, adminOnly, getCustomersController);

export default router;