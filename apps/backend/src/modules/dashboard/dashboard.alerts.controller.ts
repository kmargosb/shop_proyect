import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { asyncHandler } from '@/common/utils/asyncHandler';

export const getAlertsController = asyncHandler(async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },

    include: {
      variants: true,
    },

    take: 20,
  });

  const stockAlerts = [];

  for (const product of products) {
    for (const variant of product.variants) {
      const availableStock = variant.stock - variant.reservedStock;

      if (availableStock <= 5) {
        stockAlerts.push({
          product: product.name,
          size: variant.size,
          color: variant.color,
          stock: availableStock,

          level: availableStock === 0 ? 'critical' : availableStock <= 3 ? 'warning' : 'low',
        });
      }
    }
  }

  const refunds = await prisma.refund.aggregate({
    _sum: { amount: true },
  });

  const alerts = [];

  stockAlerts.slice(0, 5).forEach((item) => {
    alerts.push({
      type: 'STOCK',
      level: item.level,
      message: `${item.product} • ${item.color} ${item.size} → Stock ${item.stock}`,
    });
  });

  if ((refunds._sum.amount ?? 0) > 10000) {
    alerts.push({
      type: 'REFUND',
      message: 'Alto volumen de reembolsos',
    });
  }

  res.json(alerts);
});
