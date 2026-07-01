'use client';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function HomeCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-neutral-950 py-24 text-white">
      {/* BACKGROUND GLOW */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_65%)]" />

      {/* TOP LIGHT */}

      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      {/* CONTENT */}

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* LABEL */}

        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] tracking-[0.25em] text-neutral-400 uppercase backdrop-blur-sm md:px-4 md:py-2 md:text-xs">
          Camarguette Collective
        </div>

        {/* TITLE */}

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white md:mt-8 md:text-6xl">
          {t.homeCta.title}
        </h2>

        {/* DESCRIPTION */}

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 md:mt-6 md:text-lg">
          {t.homeCta.description}
        </p>

        {/* ACTIONS */}

        <div className="mt-8 flex flex-col items-center justify-center gap-4 md:mt-10">
          {/* PRIMARY ACTIONS */}

          <div className="flex flex-row gap-2 md:gap-4">
            <Link
              href="/login"
              className="inline-flex h-10 w-[120px] items-center justify-center rounded-xl bg-white px-4 text-xs font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-200 md:h-auto md:w-auto md:rounded-2xl md:px-7 md:py-4 md:text-sm"
            >
              {t.homeCta.join}
            </Link>

            <Link
              href="/contact"
              className="inline-flex h-10 w-[120px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08] md:h-auto md:w-auto md:rounded-2xl md:px-7 md:py-4 md:text-sm"
            >
              {t.homeCta.contact}
            </Link>
          </div>

          {/* SECONDARY ACTIONS */}

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500 md:gap-5 md:text-sm">
            <Link href="/shop" className="transition hover:text-white">
              {t.homeCta.shop}
            </Link>

            <span>•</span>

            <Link href="/brands" className="transition hover:text-white">
              {t.homeCta.viewBrands}
            </Link>
          </div>
        </div>

        {/* BOTTOM MINI TEXT */}

        <p className="mt-8 text-[10px] tracking-[0.2em] text-neutral-600 uppercase md:mt-10 md:text-xs">
          {t.homeCta.footer}
        </p>
      </div>
    </section>
  );
}
