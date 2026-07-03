import { request } from '@/shared/lib/request';

export const productsApi = {
  async search(queryString: string) {
    const response = await request(`/products/search?${queryString}`, {
      auth: false,
    });

    return response.json();
  },

  async getAll() {
    const response = await request('/products', {
      auth: false,
    });

    return response.json();
  },

  async getByBrand(brand: string) {
    const response = await request(`/products/brand/${brand}`, {
      auth: false,
    });

    return response.json();
  },
};
