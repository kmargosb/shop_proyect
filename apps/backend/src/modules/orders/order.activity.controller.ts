import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/common/utils/asyncHandler";

export const getActivityFeedController = asyncHandler(
  async (req: Request, res: Response) => {

    const limit = Number(req.query.limit ?? 20);

    const events = await prisma.orderEvent.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        order: {
          select: {
            id: true,
            email: true,
            totalAmount: true,
            currency: true,
          },
        },
      },
    });

    const feed = events.map((event) => {

      let eventType = "order";

      if (event.type.includes("PAYMENT")) eventType = "payment";
      if (event.type.includes("REFUND")) eventType = "refund";

      return {
        id: event.id,
        event: eventType,
        type: event.type,
        label: event.message,
        orderId: event.order.id,
        customer: event.order.email,
        amount: event.order.totalAmount,
        currency: event.order.currency,
        createdAt: event.createdAt,
      };
    });

    res.json(feed);
  }
);