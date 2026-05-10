import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";

const brandImages: Record<string, string> = {
  "cobra-skate": "/brands/cobra-skate/hero.jpg",
  "luxphere": "/brands/luxphere/hero.jpg",
  "camarguette": "/brands/camarguette/hero.jpg",
  "lust": "/brands/lust/hero.jpg",
};

const brandDescriptions: Record<string, string> = {
  "cobra-skate": "Underground skate culture and raw energy.",
  "luxphere": "Creative night sessions and visual aesthetics.",
  "camarguette": "Skateboarding, art and handmade identity.",
  "lust": "Performance, movement and modern lifestyle.",
};

export default async function FeaturedBrands() {
  const res = await apiFetch("/brands");

  const brands = res && res.ok ? await res.json() : [];

  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 text-white">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            Brands
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-5xl">
            Featured brands
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {brands.map((brand: any) => {
          const image =
            brandImages[brand.slug] ?? "/brands/camarguette/hero.jpg";

          const description =
            brandDescriptions[brand.slug] ??
            "Independent culture and creative movement.";

          return (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900"
            >
              <div className="relative h-[420px] overflow-hidden">
                <img
                  src={image}
                  alt={brand.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                <div className="absolute bottom-0 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                    {brand.slug}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {brand.name}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-300">
                    {description}
                  </p>

                  <div className="mt-5 inline-flex items-center text-sm text-white">
                    Explore brand →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}