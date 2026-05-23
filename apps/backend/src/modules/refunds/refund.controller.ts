import { Request, Response } from "express";
import { RefundService } from "./refund.service";
import { RefundReason } from "@prisma/client";
import cloudinary from "@/common/utils/cloudinary";

const DEFAULT_REASON: RefundReason = "CUSTOMER_RETURN";

const allowedReasons: RefundReason[] = [
  "CUSTOMER_RETURN",
  "DAMAGED",
  "WRONG_ITEM",
  "ORDER_CANCELLED",
  "OTHER",
];

export const RefundController = {
  async uploadEvidence(req: Request, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      if (!files.length) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

      const uploads = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ url: string; publicId: string }>((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "refund-evidence" },
                (error, result) => {
                  if (error || !result) return reject(error ?? new Error("Upload failed"));
                  resolve({ url: result.secure_url, publicId: result.public_id });
                },
              );
              stream.end(file.buffer);
            }),
        ),
      );

      return res.json({ success: true, files: uploads });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message ?? "Upload failed" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { orderId, items, reason: incomingReason, note, evidence } = req.body;
      if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "items must be a non-empty array" });
      }

      let reason: RefundReason = DEFAULT_REASON;
      if (incomingReason && allowedReasons.includes(incomingReason)) reason = incomingReason;

      const result = await RefundService.createRefund(orderId, items, reason, note, Array.isArray(evidence) ? evidence : []);
      return res.json({ success: true, refund: result });
    } catch (error: any) {
      const businessErrors = [
        "Order not found",
        "Order has no payment intent",
        "Order already fully refunded",
        "Refund items are required",
        "Item already fully refunded",
        "Refund quantity exceeds purchased quantity",
        "Invalid refund amount",
        "Refund exceeds order total",
        "Order item not found",
      ];
      const code = businessErrors.includes(error.message) ? 400 : 500;
      return res.status(code).json({ success: false, message: error.message || "Internal server error" });
    }
  },
  async approve(req: Request, res: Response) {
    try {
      const refundId = typeof req.params.refundId === "string" ? req.params.refundId : req.params.refundId[0];
      const refund = await RefundService.approveRefund(refundId);
      return res.json({ success: true, refund });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
  async reject(req: Request, res: Response) {
    try {
      const refundId = typeof req.params.refundId === "string" ? req.params.refundId : req.params.refundId[0];
      const { rejectionReason } = req.body;
      const refund = await RefundService.rejectRefund(refundId, rejectionReason);
      return res.json({ success: true, refund });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};
