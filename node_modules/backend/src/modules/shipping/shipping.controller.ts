import { Request, Response } from "express"
import { ShippingService } from "./shipping.service"

export const createShipmentController = async (
  req: Request,
  res: Response
) => {

  try {

    const { orderId, carrier, trackingNumber } = req.body

    const shipment = await ShippingService.createShipment(
      orderId,
      carrier,
      trackingNumber
    )

    res.json(shipment)

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    })

  }

}

export const updateShipmentStatusController = async (
  req: Request<{ id: string }>,
  res: Response
) => {

  try {

    const { id } = req.params
    const { status } = req.body

    const shipment = await ShippingService.updateShipmentStatus(
      id,
      status
    )

    res.json(shipment)

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    })

  }

}

export const getShipmentController = async (
  req: Request<{ orderId: string }>,
  res: Response
) => {

  try {

    const { orderId } = req.params

    const shipment = await ShippingService.getShipment(orderId)

    res.json(shipment)

  } catch (error: any) {

    res.status(400).json({
      error: error.message
    })

  }

}