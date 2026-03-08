import { Request, Response } from "express"
import { CouponService } from "./coupon.service"

export const applyCouponController = async (
  req: Request,
  res: Response
) => {

  try {

    const { orderId, code } = req.body

    const result = await CouponService.applyCoupon(orderId, code)

    res.json(result)

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    })

  }

}

export const createCouponController = async (
  req: Request,
  res: Response
) => {

  try {

    const coupon = await CouponService.createCoupon(req.body)

    res.json(coupon)

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    })

  }

}

export const listCouponsController = async (
  req: Request,
  res: Response
) => {

  const coupons = await CouponService.listCoupons()

  res.json(coupons)

}