import Image from 'next/image';
import Link from 'next/link';
import ProductView from '@/features/products/components/ProductsView';
import { brandsApi } from '@/features/brands/api/brands.api';
import { notFound } from 'next/navigation';

const BRAND_CONTENT: Record<
  string,
  {
    tagline: string;
    manifesto: string;
    statement: string;
    hero: string;
  }
> = {
  camarguette: {
    tagline: 'Built Different Since 98',
    manifesto:
      'Independent design inspired by skateboarding, craftsmanship and timeless silhouettes.',
    statement: 'Not fast fashion. Not luxury. Something in between.',
    hero: '/brands/camarguette/hero.jpg',
  },

  lust: {
    tagline: 'Luxury Without Permission',
    manifesto: 'Modern essentials designed for movement, confidence and expression.',
    statement: 'Designed for those who move differently.',
    hero: '/brands/lust/hero.jpg',
  },

  luxphere: {
    tagline: 'Future Everyday Wear',
    manifesto: 'Minimal garments built for modern lifestyles and creative minds.',
    statement: 'Timeless pieces for a constantly changing world.',
    hero: '/brands/luxphere/hero.jpg',
  },

  'cobra-skate': {
    tagline: 'Made To Ride',
    manifesto: 'Raw skateboarding heritage mixed with underground energy and authenticity.',
    statement: 'Created for the streets. Built for progression.',
    hero: '/brands/cobra-skate/hero.jpg',
  },
};

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;

  let brandData;

  try {
    brandData = await brandsApi.getBySlug(brand);
  } catch {
    notFound();
  }

  const content = BRAND_CONTENT[brand] ?? BRAND_CONTENT.camarguette;

  return (
    <main className="bg-black text-white">
      {/* HERO */}

      <section className="relative h-[85vh] min-h-[700px] overflow-hidden">
        <Image src={content.hero} alt={brandData.name} fill priority className="object-cover" />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.4em] text-neutral-300 uppercase">Featured Brand</p>

              <h1 className="mt-6 text-5xl font-black tracking-tight uppercase md:text-8xl">
                {brandData.name}
              </h1>

              <p className="mt-6 text-xl text-neutral-200 md:text-2xl">{content.tagline}</p>

              <p className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
                {content.manifesto}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/shop?brand=${brand}`}
                  className="rounded-2xl bg-white px-6 py-4 font-medium text-black transition hover:bg-neutral-200"
                >
                  Explore Collection
                </Link>

                <Link
                  href="#collection"
                  className="rounded-2xl border border-white/20 px-6 py-4 font-medium text-white transition hover:bg-white/10"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.4em] text-neutral-500 uppercase">Philosophy</p>

            <h2 className="mt-6 text-4xl font-bold md:text-6xl">{content.statement}</h2>
          </div>

          <div className="flex items-center">
            <p className="text-lg leading-relaxed text-neutral-400">{content.manifesto}</p>
          </div>
        </div>
      </section>

      {/* VISUAL SECTION */}

      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-32">
        <div className="relative overflow-hidden rounded-[40px]">
          <Image
            src={content.hero}
            alt={brandData.name}
            width={1800}
            height={1000}
            className="h-[500px] w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <h3 className="max-w-2xl text-3xl font-bold md:text-5xl">{content.statement}</h3>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="mx-auto max-w-5xl px-6 pb-20 text-center md:pb-32">
        <p className="text-xs tracking-[0.4em] text-neutral-500 uppercase">Collection</p>

        <h2 className="mt-6 text-4xl font-bold md:text-6xl">Discover the full collection</h2>

        <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
          Explore every piece from {brandData.name} and discover the latest arrivals.
        </p>

        <Link
          href={`/shop?brand=${brand}`}
          className="mt-10 inline-flex rounded-2xl bg-white px-8 py-4 font-medium text-black transition hover:bg-neutral-200"
        >
          Shop Now
        </Link>
      </section>

      {/* PRODUCTS */}

      <section id="collection">
        <ProductView brand={brand} />
      </section>
    </main>
  );
}
