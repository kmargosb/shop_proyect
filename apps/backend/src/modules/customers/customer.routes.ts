import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import {
  getCustomerOrdersController,
  getCustomerAnalyticsController,
  getCustomersController,
  getMyAddressesController,
  deleteAddressController,
  setDefaultAddressController,
  createAddressController,
  updateAddressController,
  getPreferencesController,
  updatePreferencesController,
  updateProfileController,
} from "./customer.controller";

const router = Router();

/* ===============================
   CUSTOMER ADMIN ROUTES
================================= */

router.get("/me/addresses", protect, getMyAddressesController);

router.post("/me/addresses", protect, createAddressController);

router.put("/me/addresses/:id", protect, updateAddressController);

router.delete("/me/addresses/:id", protect, deleteAddressController);

router.patch("/me/addresses/:id/favorite", protect, setDefaultAddressController);

router.patch("/me/profile", protect, updateProfileController);

router.get("/me/preferences", protect, getPreferencesController);

router.patch("/me/preferences", protect, updatePreferencesController);

router.get("/:email/orders", protect, adminOnly, getCustomerOrdersController);

router.get("/:email/analytics", protect, adminOnly, getCustomerAnalyticsController);

router.get("/", protect, adminOnly, getCustomersController);

export default router;
