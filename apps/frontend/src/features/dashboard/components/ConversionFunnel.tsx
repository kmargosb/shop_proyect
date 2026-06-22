"use client";

type Props = {
  funnel: {
    views: number;
    addToCart: number;
    checkoutStarted: number;
    purchases: number;

    addToCartRate: number;
    checkoutRate: number;
    purchaseRate: number;
  };
};

export default function ConversionFunnel({ funnel }: Props) {
  const cartWidth =
    funnel.views > 0 ? (funnel.addToCart / funnel.views) * 100 : 0;

  const checkoutWidth =
    funnel.views > 0 ? (funnel.checkoutStarted / funnel.views) * 100 : 0;

  const purchaseWidth =
    funnel.views > 0 ? (funnel.purchases / funnel.views) * 100 : 0;

  const biggestDrop = Math.max(
    100 - funnel.addToCartRate,
    100 - funnel.checkoutRate,
    100 - funnel.purchaseRate,
  );

  let recommendation = "El recorrido de compra se ve saludable.";

  if (biggestDrop === 100 - funnel.addToCartRate) {
    recommendation =
      "La mayoría de los visitantes no añaden productos al carrito. Revisa imágenes, precios y descripciones.";
  }

  if (biggestDrop === 100 - funnel.checkoutRate) {
    recommendation =
      "Los clientes añaden productos al carrito pero abandonan antes de iniciar el checkout.";
  }

  if (biggestDrop === 100 - funnel.purchaseRate) {
    recommendation =
      "Los clientes llegan al checkout pero no completan el pago. Revisa los métodos de pago y la experiencia de compra.";
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">
          Embudo de Conversión
        </h2>

        <p className="text-sm text-neutral-500">
          Analiza cómo los visitantes avanzan desde la visualización hasta la
          compra.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* VISUALIZACIONES */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">👁 Visualizaciones</p>

              <p className="text-xs text-neutral-500">Punto de entrada</p>
            </div>

            <p className="text-xl font-bold">{funnel.views}</p>
          </div>

          <div className="h-5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* CARRITO */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">🛒 Añadidos al carrito</p>

              <p className="text-xs text-neutral-500">
                {cartWidth.toFixed(1)}% de visitantes
              </p>
            </div>

            <p className="text-xl font-bold">{funnel.addToCart}</p>
          </div>

          <div className="h-5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${cartWidth}%`,
              }}
            />
          </div>
        </div>

        {/* CHECKOUT */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">💳 Checkout iniciado</p>

              <p className="text-xs text-neutral-500">
                {checkoutWidth.toFixed(1)}% de visitantes
              </p>
            </div>

            <p className="text-xl font-bold">{funnel.checkoutStarted}</p>
          </div>

          <div className="h-5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${checkoutWidth}%`,
              }}
            />
          </div>
        </div>

        {/* COMPRAS */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">✅ Compras</p>

              <p className="text-xs text-emerald-400">
                {purchaseWidth.toFixed(1)}% de visitantes
              </p>
            </div>

            <p className="text-xl font-bold text-emerald-300">
              {funnel.purchases}
            </p>
          </div>

          <div className="h-5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${purchaseWidth}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RESUMEN */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Mayor abandono
          </p>

          <p className="mt-2 text-3xl font-bold">{biggestDrop.toFixed(1)}%</p>

          <p className="mt-3 text-sm text-neutral-400">
            Usuarios perdidos antes de avanzar al siguiente paso.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Recomendación
          </p>

          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            {recommendation}
          </p>
        </div>
      </div>
    </section>
  );
}
