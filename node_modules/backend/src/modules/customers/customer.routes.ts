import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { getCustomerOrdersController } from "./customer.controller";

const router = Router();

/* ===============================
   CUSTOMER ADMIN ROUTES
================================= */

router.get("/:email/orders", protect, adminOnly, getCustomerOrdersController);

export default router;