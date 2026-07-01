import { apiFetch } from '@/shared/lib/api';
import type { Product } from '@/types/product';

function isProduct(value: unknown): value is Product {
  return typeof value === 'object' && value !== null && 'id' in value && 'name' in value;
}

export const adminProductsApi = {
  async getAll(scope: 'active' | 'archived' | 'all') {
    const res = await apiFetch(`/products?status=${scope}`);

    if (!res || !res.ok) {
      throw new Error('Failed to load products');
    }

    const data: unknown = await res.json();

    return Array.isArray(data) ? data.filter(isProduct) : [];
  },
};
