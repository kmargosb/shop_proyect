import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { sendShipmentEmail } from "@/modules/email/sendOrderEmail";
import { getIO } from "@/lib/socket";

export const ShippingService = {
  /* ==========================================
     CREATE SHIPMENT
  ========================================== */

  async createShipment(
    orderId: string,
    carrier: string,
    trackingNumber: string,
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "PAID") {
      throw new Error("Order must be paid before shipping");
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { orderId },
    });

    if (existingShipment) {
      throw new Error("Shipment already exists for this order");
    }

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        carrier,
        trackingNumber,
        status: ShipmentStatus.SHIPPED,
        shippedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },

      data: {
        status: "SHIPPED",
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId,
        type: "ORDER_SHIPPED",
        message: `Order shipped via ${carrier}`,
      },
    });

    await sendShipmentEmail(orderId);

    /* =========================
       REALTIME EVENT
    ========================= */

    const io = getIO();

    console.log("📡 emitting orderUpdated", orderId);

    io.emit("orderUpdated", {
      orderId,
    });

    return shipment;
  },

  /* ==========================================
     UPDATE TRACKING STATUS
  ========================================== */

  async updateShipmentStatus(shipmentId: string, status: ShipmentStatus) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipmentId },

      data: {
        status,

        deliveredAt:
          status === ShipmentStatus.DELIVERED ? new Date() : undefined,
      },
    });

    if (status === ShipmentStatus.SHIPPED) {
      await prisma.order.update({
        where: { id: shipment.orderId },

        data: {
          status: "SHIPPED",
        },
      });

      await prisma.orderEvent.create({
        data: {
          orderId: shipment.orderId,
          type: "ORDER_SHIPPED",
          message: "Order shipped",
        },
      });
    }

    if (status === ShipmentStatus.DELIVERED) {
      await prisma.order.update({
        where: { id: shipment.orderId },

        data: {
          status: "DELIVERED",
        },
      });

      await prisma.orderEvent.create({
        data: {
          orderId: shipment.orderId,
          type: "ORDER_DELIVERED",
          message: "Order delivered",
        },
      });
    }

    /* =========================
       REALTIME EVENT
    ========================= */

    const io = getIO();

    console.log("📡 emitting orderUpdated", shipment.orderId);

    io.emit("orderUpdated", {
      orderId: shipment.orderId,
    });

    return updatedShipment;
  },

  /* ==========================================
     GET SHIPMENT BY ORDER
  ========================================== */

  async getShipment(orderId: string) {
    return prisma.shipment.findUnique({
      where: { orderId },
    });
  },
};
