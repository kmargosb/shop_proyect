"use client";

type Insight = {
  type: "success" | "warning" | "info";
  title: string;
  message: string;
};

type Props = {
  insights: Insight[];
};

export default function AnalyticsInsights({
  insights,
}: Props) {
  if (!insights?.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-neutral-950/80 p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Insights automáticos
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Recomendaciones generadas a partir del comportamiento de la tienda.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((insight, index) => {
          const styles =
            insight.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : insight.type === "warning"
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-sky-500/20 bg-sky-500/5";

          const icon =
            insight.type === "success"
              ? "📈"
              : insight.type === "warning"
                ? "⚠️"
                : "ℹ️";

          return (
            <div
              key={index}
              className={`rounded-2xl border p-5 ${styles}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {icon}
                </span>

                <h3 className="font-medium text-white">
                  {insight.title}
                </h3>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                {insight.message}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}