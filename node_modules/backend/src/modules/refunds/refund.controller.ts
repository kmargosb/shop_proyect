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
      const { orderId, items, reason: incomingReason } = req.body;

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

      const result = await RefundService.createRefund(orderId, items, reason);

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
};
