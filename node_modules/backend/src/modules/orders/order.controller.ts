import { Request, Response } from "express";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { createOrder, getOrders, updateOrderStatus } from "./order.service";
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
  },
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
  },
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
  },
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
      `attachment; filename=invoice-${order.invoice.invoiceNumber}.pdf`,
    );

    res.send(pdf);
  },
);

// ===============================
// Página pública de compra
// ===============================
export const getPublicOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const id =
      typeof req.params.id === "string"
        ? req.params.id
        : req.params.id[0];

    const email = req.query.email as string | undefined;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        invoice: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    // 🔒 Bloquear si está cancelada
    if (order.status === "CANCELLED") {
      return res.status(403).json({
        error: "Pedido cancelado",
      });
    }

    // Si no está pagada ni en procesamiento, requiere email válido
if (
  order.status !== "PAID" &&
  order.status !== "PAYMENT_PROCESSING"
) {
  if (!email || email !== order.email) {
    return res.status(403).json({
      error: "No autorizado",
    });
  }
}

    res.json(order);
  }
);

// ===============================
// Descarga pública de Factura
// ===============================

export const downloadPublicInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const id =
      typeof req.params.id === "string"
        ? req.params.id
        : req.params.id[0];

    const email = req.query.email as string | undefined;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { invoice: true },
    });

    if (!order || !order.invoice) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    // 🔒 Solo permitir si:
    // - Está pagada
    // - O coincide email
    if (order.status !== "PAID") {
      if (!email || email !== order.email) {
        return res.status(403).json({
          error: "No autorizado",
        });
      }
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