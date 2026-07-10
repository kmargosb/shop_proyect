import { apiFetch } from '@/shared/lib/api';
import type { Address, CheckoutResponse } from '../types';

export async function fetchAddresses(): Promise<Address[]> {
  const res = await apiFetch('/customers/me/addresses');

  if (!res || !res.ok) {
    return [];
  }

  return res.json();
}

export async function deleteAddress(id: string) {
  const res = await apiFetch(`/addresses/${id}`, {
    method: 'DELETE',
  });

  return !!res?.ok;
}

export async function setFavoriteAddress(id: string) {
  const res = await apiFetch(`/customers/me/addresses/${id}/favorite`, {
    method: 'PATCH',
  });

  return !!res?.ok;
}

export async function checkout(payload: any): Promise<CheckoutResponse> {
  const res = await apiFetch('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res) {
    throw new Error('Connection error');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);

    throw new Error(data?.error || 'Unable to process checkout');
  }

  return res.json();
}
