import { apiFetch } from "@/shared/lib/api";
import BrandsLanding from "@/features/brands/BrandsLanding";

export default async function BrandsPage() {
  const res = await apiFetch("/brands");

  const brands = res && res.ok ? await res.json() : [];

  return <BrandsLanding brands={brands} />;
}