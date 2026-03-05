import { Request, Response } from "express"
import { RefundService } from "./refund.service"

export const RefundController = {

  async create(req: Request, res: Response) {

    try {

      const { orderId, items, reason } = req.body

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required"
        })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "items must be a non-empty array"
        })
      }

      const result = await RefundService.createRefund(
        orderId,
        items,
        reason
      )

      return res.json({
        success: true,
        ...result
      })

    } catch (error: any) {

      console.error("Refund error:", error)

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      })

    }

  }

}