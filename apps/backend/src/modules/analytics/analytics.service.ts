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

export async function getAnalyticsInsights() {
  const funnel = await getFunnelAnalytics();

  const products = await getTopProductsAnalytics();

  console.log("FUNNEL:", funnel);
console.log("PRODUCTS:", products);

  const insights: {
    type: "success" | "warning" | "info";
    title: string;
    message: string;
  }[] = [];

  /* =========================
     TOP PRODUCT
  ========================= */

  const bestProduct = products[0];

  if (bestProduct) {
    insights.push({
      type: "success",
      title: "Producto destacado",
      message: `${bestProduct.name} lidera el rendimiento actual con una conversión del ${bestProduct.conversionRate}%.`,
    });
  }

  /* =========================
     VISITS -> CART
  ========================= */

  if (funnel.addToCartRate < 10) {
    insights.push({
      type: "warning",
      title: "Oportunidad detectada",
      message:
        "Muchos visitantes ven productos, pero pocos los añaden al carrito. Revisa imágenes, precios y descripciones.",
    });
  }

  /* =========================
     CART -> CHECKOUT
  ========================= */

  else if (funnel.checkoutRate < 40) {
    insights.push({
      type: "warning",
      title: "Oportunidad detectada",
      message:
        "Existe una caída importante entre carrito y checkout. Simplificar el proceso de compra podría mejorar las conversiones.",
    });
  }

  /* =========================
     CHECKOUT -> PURCHASE
  ========================= */

  else if (funnel.purchaseRate < 50) {
    insights.push({
      type: "warning",
      title: "Oportunidad detectada",
      message:
        "Los usuarios llegan al checkout pero muchos no completan el pago. Revisa métodos de pago y experiencia de compra.",
    });
  }

  /* =========================
     HEALTHY FUNNEL
  ========================= */

  else {
    insights.push({
      type: "success",
      title: "Embudo saludable",
      message:
        "El recorrido de compra muestra un comportamiento estable y sin pérdidas significativas.",
    });
  }

  /* =========================
     PURCHASES
  ========================= */

  if (funnel.purchases > 0) {
    insights.push({
      type: "info",
      title: "Actividad reciente",
      message: `Se han registrado ${funnel.purchases} compras completadas.`,
    });
  }

  console.log("INSIGHTS:", insights);
  return insights;
}