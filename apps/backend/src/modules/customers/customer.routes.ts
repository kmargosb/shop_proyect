import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
   getCustomerOrdersController,
   getCustomerAnalyticsController,
   getCustomersController,
   getMyAddressesController,
   deleteAddressController,
  setDefaultAddressController
} from "./customer.controller";

const router = Router();

/* ===============================
   CUSTOMER ADMIN ROUTES
================================= */

router.get("/me/addresses", protect, getMyAddressesController);

router.delete("/me/addresses/:id", protect, deleteAddressController);

router.patch("/me/addresses/:id/favorite", protect, setDefaultAddressController);

router.get("/:email/orders", protect, adminOnly, getCustomerOrdersController);

router.get("/:email/analytics", protect, adminOnly, getCustomerAnalyticsController);

router.get("/", protect, adminOnly, getCustomersController);

export default router;