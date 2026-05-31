import { Router } from "express";
import { RefundController } from "./refund.controller";
import { protect, adminOnly } from "@/common/middleware/auth.middleware";

const router = Router();

router.post("/", RefundController.create);
router.post("/:refundId/approve", protect, adminOnly, RefundController.approve);
router.post("/:refundId/received", protect, adminOnly, RefundController.received);
router.post("/:refundId/process", protect, adminOnly, RefundController.process);
router.post("/:refundId/reject", protect, adminOnly, RefundController.reject);

export default router;
