import { Router } from "express";
import { downloadInvoice } from "./invoice.controller";
import { protect } from "@/common/middleware/auth.middleware";

const router = Router();

router.get("/:id/download", protect, downloadInvoice);

export default router;