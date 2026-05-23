import { Router } from "express";
import { RefundController } from "./refund.controller";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import upload from "@/common/middleware/upload.middleware";

const router = Router();

router.post("/upload-evidence", upload.array("files", 8), RefundController.uploadEvidence);
router.post("/", RefundController.create);
router.post("/:refundId/approve", protect, adminOnly, RefundController.approve);
router.post("/:refundId/reject", protect, adminOnly, RefundController.reject);

export default router;
