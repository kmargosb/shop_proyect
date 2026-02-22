import { Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { createOrder } from "../services/order.service"
import { AuthRequest } from "../middleware/auth.middleware"

export const createOrderController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      items,
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
    } = req.body

    const order = await createOrder({
      userId: req.user?.id,
      items,
      fullName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country,
    })

    res.status(201).json(order)
  }
)