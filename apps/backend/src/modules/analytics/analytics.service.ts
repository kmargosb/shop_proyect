import { prisma } from "@/lib/prisma";

export async function trackEvent(data: {
  userId?: string;
  productId?: string;
  event: string;
  metadata?: any;
}) {
  return prisma.analyticsEvent.create({
    data,
  });
}
