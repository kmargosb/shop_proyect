import { serverFetch } from '../client';

export async function getProducts() {
  return serverFetch('/products');
}

export async function getProduct(productId: string) {
  return serverFetch(`/products/${productId}`);
}

export async function getProductsByBrand(brand: string) {
  return serverFetch(`/products/brand/${brand}`);
}
