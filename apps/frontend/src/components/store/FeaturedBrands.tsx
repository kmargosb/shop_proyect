import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";

export default async function FeaturedBrands() {
  const res = await apiFetch("/brands");
  const brands = res && res.ok ? await res.json() : [];

  if (!brands.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-10">Featured Brands</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {brands.map((brand: any) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="bg-neutral-900 rounded-xl p-10 text-center
               hover:scale-[1.02] hover:bg-neutral-800
               transition transform"
          >
            <span className="text-lg font-medium text-white">{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
