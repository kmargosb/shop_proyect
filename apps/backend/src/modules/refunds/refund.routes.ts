import { Router } from "express";
import { RefundController } from "./refund.controller";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";
import upload from "@/common/middleware/upload.middleware";

const router = Router();

router.post("/", upload.array("images", 5), RefundController.create);
router.post("/:refundId/approve", protect, adminOnly, RefundController.approve);
router.post("/:refundId/sent", RefundController.sent);
router.post("/:refundId/received", protect, adminOnly, RefundController.received);
router.post("/:refundId/process", protect, adminOnly, RefundController.process);
router.post("/:refundId/reject", protect, adminOnly, RefundController.reject);

export default router;
