"use client";

type ProductAnalytics = {
  id: string;
  name: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
};

type Props = {
  products: ProductAnalytics[];
};

export default function TopProductsAnalytics({ products }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Productos Destacados
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Productos con mayor interacción y mejor rendimiento en ventas.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {products.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-6 text-center text-neutral-500">
            Aún no hay datos suficientes.
          </div>
        )}

        {products.map((product, index) => {
          let status = "📈 Buen nivel de interacción";

          if (product.views < 10) {
            status = "🆕 Datos insuficientes";
          }

          if (product.views >= 10 && product.conversionRate < 2) {
            status = "⚠ Mucho interés, pocas compras";
          }

          if (product.conversionRate >= 5) {
            status = "🔥 Conversión excelente";
          }

          const ranking =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ranking}</span>

                    <h3 className="font-semibold text-white">{product.name}</h3>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Conversión total
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-300">
                    {product.conversionRate}%
                  </p>
                </div>
              </div>

              {/* PROGRESO */}

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Conversión</span>

                  <span>{product.conversionRate}%</span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${Math.min(product.conversionRate, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* MÉTRICAS */}

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 p-3">
                  <p className="text-xs text-neutral-500">Vistas</p>

                  <p className="mt-1 text-lg font-semibold">{product.views}</p>
                </div>

                <div className="rounded-xl border border-white/10 p-3">
                  <p className="text-xs text-neutral-500">Carrito</p>

                  <p className="mt-1 text-lg font-semibold">
                    {product.addToCart}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 p-3">
                  <p className="text-xs text-neutral-500">Compras</p>

                  <p className="mt-1 text-lg font-semibold text-emerald-300">
                    {product.purchases}
                  </p>
                </div>
              </div>

              {/* ESTADO */}

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Estado
                </span>

                <span className="text-sm text-neutral-300">{status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
