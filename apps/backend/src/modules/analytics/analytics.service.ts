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

export async function getFunnelAnalytics() {
  const [views, addToCart, checkoutStarted, purchases] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        event: "PRODUCT_VIEW",
      },
    }),

    prisma.analyticsEvent.count({
      where: {
        event: "ADD_TO_CART",
      },
    }),

    prisma.analyticsEvent.count({
      where: {
        event: "CHECKOUT_STARTED",
      },
    }),

    prisma.analyticsEvent.count({
      where: {
        event: "PURCHASE_COMPLETED",
      },
    }),
  ]);

  return {
    views,
    addToCart,
    checkoutStarted,
    purchases,

    addToCartRate:
      views > 0 ? Number(((addToCart / views) * 100).toFixed(1)) : 0,

    checkoutRate:
      addToCart > 0
        ? Number(((checkoutStarted / addToCart) * 100).toFixed(1))
        : 0,

    purchaseRate:
      checkoutStarted > 0
        ? Number(((purchases / checkoutStarted) * 100).toFixed(1))
        : 0,
  };
}

export async function getTopProductsAnalytics() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,

      analyticsEvents: {
        select: {
          event: true,
        },
      },
    },
  });

  return products
    .map((product) => {
      const views = product.analyticsEvents.filter(
        (e) => e.event === "PRODUCT_VIEW",
      ).length;

      const addToCart = product.analyticsEvents.filter(
        (e) => e.event === "ADD_TO_CART",
      ).length;

      const purchases = product.analyticsEvents.filter(
        (e) => e.event === "PRODUCT_PURCHASED",
      ).length;

      return {
        id: product.id,
        name: product.name,

        views,
        addToCart,
        purchases,

        conversionRate:
          views > 0 ? Number(((purchases / views) * 100).toFixed(2)) : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}
