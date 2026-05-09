import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { globalSearchController } from "./admin.search.controller";
import { getSettingsController, patchSettingsController } from "./admin.settings.controller";

const router = Router();

router.get("/search", protect, adminOnly, globalSearchController);
router.get("/settings", protect, adminOnly, getSettingsController);
router.patch("/settings", protect, adminOnly, patchSettingsController);

export default router;
