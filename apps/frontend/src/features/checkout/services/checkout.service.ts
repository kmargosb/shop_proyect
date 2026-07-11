import { request } from '@/shared/lib/request';
import type { Address, CheckoutResponse } from '../types';

export async function fetchAddresses(): Promise<Address[]> {
  const response = await request('/customers/me/addresses');

  return response.json();
}

export async function deleteAddress(id: string) {
  await request(`/customers/me/addresses/${id}`, {
    method: 'DELETE',
  });

  return true;
}

export async function setFavoriteAddress(data: { id: string; type: 'SHIPPING' | 'BILLING' }) {
  await request(`/customers/me/addresses/${data.id}/favorite`, {
    method: 'PATCH',
    body: JSON.stringify({
      type: data.type,
    }),
  });

  return true;
}

export async function checkout(payload: any): Promise<CheckoutResponse> {
  const response = await request('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.json();
}
