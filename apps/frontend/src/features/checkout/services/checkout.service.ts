import { request } from '@/shared/lib/request';
import type { Address, CheckoutResponse } from '../types';

export async function fetchAddresses(): Promise<Address[]> {
  const response = await request('/customers/me/addresses');

  return response.json();
}

export async function deleteAddress(id: string) {
  await request(`/addresses/${id}`, {
    method: 'DELETE',
  });

  return true;
}

export async function setFavoriteAddress(id: string) {
  await request(`/customers/me/addresses/${id}/favorite`, {
    method: 'PATCH',
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
