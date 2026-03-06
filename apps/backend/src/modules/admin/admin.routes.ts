import { Router } from "express";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import { globalSearchController } from "./admin.search.controller";

const router = Router();

router.get("/search", protect, adminOnly, globalSearchController);

export default router;