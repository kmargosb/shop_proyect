import Link from 'next/link';
import { apiFetch } from '@/shared/lib/api';

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

export default async function FeaturedBrands() {
  const res = await apiFetch('/brands');

  const brands = res && res.ok ? await res.json() : [];

  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 text-white md:px-6 md:py-20">
      {/* HEADER */}

      <div className="mb-8 flex items-end justify-between md:mb-10">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-neutral-500 uppercase">Brands</p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Featured brands</h2>
        </div>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-2 gap-3 md:gap-6 xl:grid-cols-4">
        {brands.map((brand: any) => {
          const image = brandImages[brand.slug] ?? '/brands/camarguette/hero.jpg';

          const description =
            brandDescriptions[brand.slug] ?? 'Independent culture and creative movement.';

          return (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="relative h-[240px] overflow-hidden md:h-[420px]">
                {/* IMAGE */}

                <img
                  src={image}
                  alt={brand.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* OVERLAY */}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* CONTENT */}

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                  <p className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase md:text-xs">
                    {brand.slug}
                  </p>

                  <h3 className="mt-2 text-lg font-bold md:text-2xl">{brand.name}</h3>

                  {/* DESCRIPTION */}

                  <p className="mt-2 hidden text-sm leading-6 text-neutral-300 md:block">
                    {description}
                  </p>

                  {/* CTA */}

                  <div className="mt-3 inline-flex items-center text-xs text-white md:mt-5 md:text-sm">
                    Explore →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* ALL BRANDS CTA */}

      <div className="mt-10 flex justify-center md:mt-14">
        <Link
          href="/brands"
          className="group inline-flex items-center gap-3 rounded-2xl border border-black/10 bg-black px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-neutral-800"
        >
          <span>View all brands</span>

          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
