import { apiFetch } from '@/shared/lib/api';

type AddItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

export async function addItem(data: AddItemInput) {
  const res = await apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res?.ok) {
    throw new Error('Failed to add item');
  }

  return res.json();
}
