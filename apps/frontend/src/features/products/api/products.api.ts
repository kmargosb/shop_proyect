import { apiFetch } from "@/shared/lib/api";

export const productsApi = {
  async search(queryString: string) {
    const res = await apiFetch(`/products/search?${queryString}`);

    if (!res || !res.ok) return [];

    return res.json();
  },

  async getAll() {
    const res = await apiFetch("/products");

    if (!res || !res.ok) return [];

    return res.json();
  },

  async getByBrand(brand: string) {
    const res = await apiFetch(`/products/brand/${brand}`);

    if (!res || !res.ok) return [];

    return res.json();
  },
};