import { Request, Response } from "express";
import { RefundService } from "./refund.service";
import { RefundReason } from "@prisma/client";

/* =========================
   CONFIG
========================= */

const DEFAULT_REASON: RefundReason = "CUSTOMER_RETURN";

const allowedReasons: RefundReason[] = [
  "CUSTOMER_RETURN",
  "DAMAGED",
  "WRONG_ITEM",
  "FRAUD",
  "ORDER_CANCELLED",
  "OTHER",
];

/* =========================
   CONTROLLER
========================= */

export const RefundController = {
  async create(req: Request, res: Response) {
    try {
      const { orderId, reason: incomingReason, note } = req.body;

      const items =
        typeof req.body.items === "string"
          ? JSON.parse(req.body.items)
          : req.body.items;

      const files = req.files as Express.Multer.File[];

      /* =========================
         VALIDACIÓN
      ========================= */

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required",
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "items must be a non-empty array",
        });
      }

      /* =========================
         NORMALIZAR REASON 🔥
      ========================= */

      let reason: RefundReason = DEFAULT_REASON;

      if (incomingReason && allowedReasons.includes(incomingReason)) {
        reason = incomingReason;
      }

      console.log("🔁 Refund request:", {
        orderId,
        items,
        reason,
      });

      /* =========================
         SERVICE
      ========================= */

      const evidence: {
        url: string;
        publicId?: string;
      }[] = [];

      if (files?.length) {
        const cloudinary = (await import("@/common/utils/cloudinary")).default;

        for (const file of files) {
          const uploaded: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "refunds",
                },
                (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                },
              )
              .end(file.buffer);
          });

          evidence.push({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
          });
        }
      }

      const result = await RefundService.createRefund(
        orderId,
        items,
        reason,
        note,
        evidence,
      );

      /* =========================
         RESPONSE LIMPIO
      ========================= */

      return res.json({
        success: true,
        refund: result,
      });
    } catch (error: any) {
      console.error("🔥 Refund error:", error);

      const businessErrors = [
        "Order not found",
        "Order has no payment intent",
        "Order already fully refunded",
        "Refund items are required",
        "Item already fully refunded",
        "Refund quantity exceeds purchased quantity",
        "Invalid refund amount",
        "Refund exceeds order total",
      ];

      if (businessErrors.includes(error.message)) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
  async approve(req: Request, res: Response) {
    try {
      const refundId =
        typeof req.params.refundId === "string"
          ? req.params.refundId
          : req.params.refundId[0];

      const refund = await RefundService.approveRefund(refundId);

      return res.json({
        success: true,
        refund,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  async sent(req: Request, res: Response) {
    try {
      const refundId =
        typeof req.params.refundId === "string"
          ? req.params.refundId
          : req.params.refundId[0];

      const refund = await RefundService.markCustomerSent(refundId);

      return res.json({
        success: true,
        refund,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  async received(req: Request, res: Response) {
    try {
      const refundId =
        typeof req.params.refundId === "string"
          ? req.params.refundId
          : req.params.refundId[0];

      const refund = await RefundService.markRefundReceived(refundId);

      return res.json({
        success: true,
        refund,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  async process(req: Request, res: Response) {
    try {
      const refundId =
        typeof req.params.refundId === "string"
          ? req.params.refundId
          : req.params.refundId[0];

      const refund = await RefundService.processRefund(refundId);

      return res.json({
        success: true,
        refund,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  async reject(req: Request, res: Response) {
    try {
      const refundId =
        typeof req.params.refundId === "string"
          ? req.params.refundId
          : req.params.refundId[0];

      const { rejectionReason } = req.body;

      const refund = await RefundService.rejectRefund(
        refundId,
        rejectionReason,
      );

      return res.json({
        success: true,
        refund,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
