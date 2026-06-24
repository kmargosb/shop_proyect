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

        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs tracking-[0.25em] text-neutral-400 uppercase backdrop-blur-sm">
          Camarguette Collective
        </div>

        {/* TITLE */}

        <h2 className="mt-8 text-4xl font-bold tracking-tight text-white md:text-6xl">
          {t.homeCta.title}
        </h2>

        {/* DESCRIPTION */}

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
          {t.homeCta.description}
        </p>

        {/* ACTIONS */}

        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          {/* PRIMARY ACTIONS */}

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-200"
            >
              {t.homeCta.join}
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-8 py-4 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08]"
            >
              {t.homeCta.contact}
            </Link>
          </div>

          {/* SECONDARY ACTIONS */}

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-neutral-500">
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

        <p className="text-xm mt-10 tracking-[0.2em] text-neutral-600 uppercase">
          {t.homeCta.footer}
        </p>
      </div>
    </section>
  );
}
