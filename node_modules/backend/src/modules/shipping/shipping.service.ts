import { prisma } from "@/lib/prisma"
import { ShipmentStatus } from "@prisma/client"

export const ShippingService = {

  /* ==========================================
     CREATE SHIPMENT
  ========================================== */

  async createShipment(
    orderId: string,
    carrier: string,
    trackingNumber: string
  ) {

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new Error("Order not found")
    }

    if (order.status !== "PAID") {
      throw new Error("Order must be paid before shipping")
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { orderId }
    })

    if (existingShipment) {
      throw new Error("Shipment already exists for this order")
    }

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        carrier,
        trackingNumber,
        status: ShipmentStatus.SHIPPED,
        shippedAt: new Date()
      }
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED"
      }
    })

    await prisma.orderEvent.create({
      data: {
        orderId,
        type: "ORDER_SHIPPED",
        message: `Order shipped via ${carrier}`
      }
    })

    return shipment
  },

  /* ==========================================
     UPDATE TRACKING STATUS
  ========================================== */

  async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus
  ) {

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId }
    })

    if (!shipment) {
      throw new Error("Shipment not found")
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        deliveredAt:
          status === ShipmentStatus.DELIVERED
            ? new Date()
            : undefined
      }
    })

    return updatedShipment
  },

  /* ==========================================
     GET SHIPMENT BY ORDER
  ========================================== */

  async getShipment(orderId: string) {

    return prisma.shipment.findUnique({
      where: { orderId }
    })

  }

}