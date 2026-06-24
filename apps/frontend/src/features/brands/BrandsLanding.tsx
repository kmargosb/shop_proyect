'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  brands: Brand[];
}

const brandImages: Record<string, string> = {
  'cobra-skate': '/brands/cobra-skate/hero.jpg',
  luxphere: '/brands/luxphere/hero.jpg',
  camarguette: '/brands/camarguette/hero.jpg',
  lust: '/brands/lust/hero.jpg',
};

const brandDescriptions: Record<string, string> = {
  'cobra-skate': 'Underground skate culture and raw energy.',

  luxphere: 'Creative night sessions and visual aesthetics.',

  camarguette: 'Skateboarding, art and handmade identity.',

  lust: 'Performance, movement and modern lifestyle.',
};

export default function BrandsLanding({ brands }: Props) {
  if (!brands || brands.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        No brands available
      </main>
    );
  }

  const initialBrand = brands.find((b) => b.slug === 'camarguette') ?? brands[0];

  const [activeBrand, setActiveBrand] = useState(initialBrand);

  const image = useMemo(
    () => brandImages[activeBrand.slug] ?? '/brands/camarguette/hero.jpg',
    [activeBrand],
  );

  const description = useMemo(
    () => brandDescriptions[activeBrand.slug] ?? 'Independent culture and creative movement.',
    [activeBrand],
  );

  return (
    <main className="h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
      <div className="h-full md:mx-auto md:max-w-7xl md:px-8">
        <div className="grid h-full gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* IMAGE */}

          <div className="relative overflow-hidden md:rounded-none">
            <div className="relative h-[55vh] md:h-[70vh]">
              <Image
                src={image}
                alt={activeBrand.name}
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-5 md:p-8">
              <p className="text-[11px] tracking-[0.35em] text-neutral-400 uppercase">
                Featured Brand
              </p>

              <h1 className="mt-2 text-3xl font-bold md:text-6xl">{activeBrand.name}</h1>

              <p className="mt-2 max-w-md text-xs leading-relaxed text-neutral-300 md:text-base">
                {description}
              </p>

              <Link
                href={`/brands/${activeBrand.slug}`}
                className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
              >
                Explore Brand →
              </Link>
            </div>
          </div>

          {/* SELECTOR */}

          <div className="flex flex-col justify-center px-5 md:px-0">
            <p className="mb-6 text-[11px] tracking-[0.35em] text-neutral-500 uppercase">
              Collective
            </p>

            <div className="flex flex-wrap gap-4 lg:flex-col">
              {brands.map((brand) => {
                const active = activeBrand.id === brand.id;

                return (
                  <button
                    key={brand.id}
                    onClick={() => setActiveBrand(brand)}
                    onMouseEnter={() => setActiveBrand(brand)}
                    className={`shrink-0 cursor-pointer snap-center text-left transition-all ${
                      active ? 'text-white' : 'text-neutral-600 hover:text-neutral-300'
                    } `}
                  >
                    <span
                      className={`block text-xl font-black tracking-tight uppercase transition-all duration-300 md:text-6xl ${
                        active ? 'text-white' : 'text-neutral-600'
                      } `}
                    >
                      {brand.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
