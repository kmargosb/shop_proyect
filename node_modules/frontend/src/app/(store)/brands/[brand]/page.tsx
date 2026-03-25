import ProductList from "@/features/products/components/ProductList";
import { apiFetch } from "@/shared/lib/api";
import { notFound } from "next/navigation";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;

  /* ===============================
     VALIDATE BRAND
  =============================== */

  const res = await apiFetch(`/brands/${brand}`);

  if (!res || res.status === 404) {
    notFound(); // 🔥 esto crea 404 real
  }

  const brandData = await res.json();

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">
        {brandData.name}
      </h1>

      <ProductList brand={brand} />
    </main>
  );
}