import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-neutral-950 py-24 text-white">
      {/* BACKGROUND GLOW */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.25em] text-neutral-400">
          Camarguette Collective
        </div>

        <h2 className="mt-8 text-4xl font-bold tracking-tight text-white md:text-6xl">
          Descubre tu estilo
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
          Diseño minimalista, inspiración urbana y una experiencia creada para quienes buscan algo diferente.
        </p>

        {/* ACTIONS */}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="
              inline-flex items-center justify-center
              rounded-2xl
              bg-white px-8 py-4
              text-sm font-semibold text-black
              transition-all duration-300
              hover:scale-[1.02]
              hover:bg-neutral-200
            "
          >
            Explorar tienda
          </Link>

          <Link
            href="/brands"
            className="
              inline-flex items-center justify-center
              rounded-2xl
              border border-white/10
              bg-white/[0.03]
              px-8 py-4
              text-sm font-medium text-white
              transition-all duration-300
              hover:border-white/20
              hover:bg-white/[0.06]
            "
          >
            Ver marcas
          </Link>
        </div>
      </div>
    </section>
  );
}