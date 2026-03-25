import { apiFetch } from "@/shared/lib/api";

export async function getBrandBySlug(slug: string) {
  const res = await apiFetch(`/brands/${slug}`);

  if (!res || !res.ok) return null;

  return res.json();
}