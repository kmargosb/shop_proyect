import { request } from '@/shared/lib/request';

export type Brand = {
  id: string;
  name: string;
  slug: string;
};

export const brandsApi = {
  async getAll(): Promise<Brand[]> {
    const response = await request('/brands', {
      auth: false,
    });

    return response.json();
  },

  async getBySlug(slug: string): Promise<Brand> {
    const response = await request(`/brands/${slug}`, {
      auth: false,
    });

    return response.json();
  },
};
