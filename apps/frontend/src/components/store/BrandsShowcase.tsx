'use client';

import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/LanguageContext';

export default function BrandsShowcase() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[650px] overflow-hidden bg-black text-white">
      {/* VIDEO */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="https://res.cloudinary.com/dhybf1y2t/video/upload/v1782730215/videos/Camarguette2_5MB_wvyoet.mp4" />
      </video>

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-black/45" />

      {/* CONTENT */}

      <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-14">
        <div className="max-w-xl">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] tracking-[0.25em] text-white/70 uppercase backdrop-blur-sm">
            {t.brandsShowcase.label}
          </div>

          <h2 className="mt-4 text-2xl leading-tight font-bold md:mt-5 md:text-5xl">
            {t.brandsShowcase.title}
          </h2>

          <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/80 md:mt-4 md:max-w-xl md:text-base">
            {t.brandsShowcase.description}
          </p>

          <Link
            href="/brands"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-neutral-200 md:mt-6 md:gap-3 md:px-6 md:py-3 md:text-sm"
          >
            {t.brandsShowcase.button} →
          </Link>
        </div>
      </div>
    </section>
  );
}
