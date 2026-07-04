import { request } from '@/shared/lib/request';
import type { Product } from '@/types/product';

export const productsApi = {
  async search(queryString: string): Promise<Product[]> {
    const response = await request(`/products/search?${queryString}`, {
      auth: false,
    });

    return response.json();
  },

  async getAll(): Promise<Product[]> {
    const response = await request('/products', {
      auth: false,
    });

    return response.json();
  },

  async getByBrand(brand: string): Promise<Product[]> {
    const response = await request(`/products/brand/${brand}`, {
      auth: false,
    });

    return response.json();
  },

  async getById(id: string): Promise<Product> {
    const response = await request(`/products/${id}`, {
      auth: false,
    });

    return response.json();
  },
};
