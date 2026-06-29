import Image from 'next/image';
import Link from 'next/link';
import { CarouselItem } from '@/shared/ui/carousel';
import type { Slide } from './data/heroSlides';

type Props = {
  slide: Slide;
  index: number;
};

export default function HeroSlide({ slide, index }: Props) {
  return (
    <CarouselItem>
      <div className="relative h-[75svh] w-full md:h-[82vh]">
        {/* DESKTOP */}

        <Image
          src={slide.imageDesktop}
          alt={slide.title}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : 'lazy'}
          className="hidden object-cover object-center md:block"
        />

        {/* MOBILE */}

        <Image
          src={slide.imageMobile}
          alt={slide.title}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : 'lazy'}
          className="object-cover object-center md:hidden"
        />

        {/* OVERLAYS */}

        <div className="absolute inset-0 bg-black/45 md:bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:hidden" />

        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/50 via-transparent to-black/10 md:block" />

        {/* CONTENT */}

        <div className="absolute inset-0 flex items-end justify-center px-6 pb-20 md:items-center md:justify-start md:px-20 md:pb-0">
          <div className="max-w-xl text-center text-white md:text-left">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] tracking-[0.25em] text-neutral-300 uppercase backdrop-blur-sm">
              Camarguette Collective
            </div>

            <h2 className="mt-6 text-5xl leading-[0.95] font-bold tracking-tight md:text-7xl">
              {slide.title}
            </h2>

            <p className="mt-5 text-base leading-relaxed text-neutral-300 md:max-w-lg md:text-lg">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:items-start">
              <Link
                href={slide.link}
                className="inline-flex h-14 w-[220px] items-center justify-center rounded-2xl bg-white px-7 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-200"
              >
                Shop now
              </Link>

              <Link
                href="/brands"
                className="inline-flex h-14 w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-7 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08]"
              >
                Explore brands
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
