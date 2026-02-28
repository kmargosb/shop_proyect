import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "./order.service";
import { AuthRequest } from "@/common/middleware/auth.middleware";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/modules/invoices/invoice.generator";

/**
 * Crear orden
 */
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
    } = req.body;

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
    });

    res.status(201).json(order);
  }
);

/**
 * Obtener órdenes (admin)
 */
export const getOrdersController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit, status } = req.query;

    const result = await getOrders({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string | undefined,
    });

    res.json(result);
  }
);

/**
 * Actualizar estado de orden
 */
export const updateOrderStatusController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const { status } = req.body;

    const updated = await updateOrderStatus(id, status);

    res.json(updated);
  }
);

/**
 * Descargar factura desde Order
 * GET /orders/:id/invoice
 */
export const downloadOrderInvoice = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: true,
      },
    });

    if (!order || !order.invoice) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    const pdf = await generateInvoicePDF(order.invoice.id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.invoice.invoiceNumber}.pdf`
    );

    res.send(pdf);
  }
);