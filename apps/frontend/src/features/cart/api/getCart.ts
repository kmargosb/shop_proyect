import { apiFetch } from '@/shared/lib/api';

export async function getCart() {
  const res = await apiFetch('/cart');

  if (!res?.ok) {
    throw new Error('Failed to load cart');
  }

  return res.json();
}
