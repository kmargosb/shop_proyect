import Link from "next/link";
import { apiFetch } from "@/shared/lib/api";

export default async function BrandsPage() {
  const res = await apiFetch("/brands");

  const brands = res && res.ok ? await res.json() : [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-10">Marcas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {brands.map((brand: any) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="bg-neutral-900 rounded-xl p-8 hover:bg-neutral-800 transition cursor-pointer text-white"
          >
            <h2 className="text-xl font-semibold">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
