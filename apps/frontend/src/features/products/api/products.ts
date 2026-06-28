import { serverFetch } from '../../../shared/server/client';
import type { Product } from '@/types/product';

export async function getProducts() {
  return serverFetch<Product[]>('/products');
}

export async function getProductsByBrand(brand: string) {
  return serverFetch<Product[]>(`/products/brand/${brand}`);
}
