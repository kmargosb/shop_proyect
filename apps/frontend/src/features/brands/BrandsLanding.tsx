"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  brands: Brand[];
}

const brandImages: Record<string, string> = {
  "cobra-skate": "/brands/cobra-skate/hero.jpg",
  luxphere: "/brands/luxphere/hero.jpg",
  camarguette: "/brands/camarguette/hero.jpg",
  lust: "/brands/lust/hero.jpg",
};

const brandDescriptions: Record<string, string> = {
  "cobra-skate": "Underground skate culture and raw energy.",

  luxphere: "Creative night sessions and visual aesthetics.",

  camarguette: "Skateboarding, art and handmade identity.",

  lust: "Performance, movement and modern lifestyle.",
};

export default function BrandsLanding({ brands }: Props) {
  const initialBrand =
    brands.find((b) => b.slug === "camarguette") ?? brands[0];

  const [activeBrand, setActiveBrand] = useState(initialBrand);

  const image = useMemo(
    () => brandImages[activeBrand.slug] ?? "/brands/camarguette/hero.jpg",
    [activeBrand],
  );

  const description = useMemo(
    () =>
      brandDescriptions[activeBrand.slug] ??
      "Independent culture and creative movement.",
    [activeBrand],
  );

  return (
    <main className="bg-black text-white h-[calc(100vh-64px)] overflow-hidden">
      <div className="h-full md:max-w-7xl md:mx-auto md:px-8">
        <div className="h-full grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
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
              <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-400">
                Featured Brand
              </p>

              <h1 className="mt-2 text-3xl md:text-6xl font-bold">
                {activeBrand.name}
              </h1>

              <p className="mt-2 max-w-md text-xs md:text-base text-neutral-300 leading-relaxed">
                {description}
              </p>

              <Link
                href={`/brands/${activeBrand.slug}`}
                className="
                  mt-6 inline-flex items-center
                  rounded-xl
                  bg-white
                  px-5 py-3
                  text-sm font-medium
                  text-black
                  transition
                  hover:bg-neutral-200
                "
              >
                Explore Brand →
              </Link>
            </div>
          </div>

          {/* SELECTOR */}

          <div className="flex flex-col justify-center px-5 md:px-0">
            <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-neutral-500">
              Collective
            </p>

            <div
  className="
    flex flex-wrap gap-4
    lg:flex-col
  "
>
              {brands.map((brand) => {
                const active = activeBrand.id === brand.id;

                return (
                  <button
                    key={brand.id}
                    onClick={() => setActiveBrand(brand)}
                    onMouseEnter={() => setActiveBrand(brand)}
                    className={`
                      text-left transition-all cursor-pointer snap-center shrink-0
                      ${
                        active
  ? "text-white"
  : "text-neutral-600 hover:text-neutral-300"
                      }
                    `}
                  >
                  <span
  className={`
    block
    text-xl md:text-6xl
    font-black
    uppercase
    tracking-tight
    transition-all duration-300
    ${
      active
        ? "text-white"
        : "text-neutral-600"
    }
  `}
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
