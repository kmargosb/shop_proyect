import { request } from '@/shared/lib/request';
import type { AddressPayload } from './types';

export async function getAddresses() {
  const response = await request('/customers/me/addresses');

  return response.json();
}

export async function createAddress(data: AddressPayload) {
  const response = await request('/customers/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateAddress(id: string, data: AddressPayload) {
  const response = await request(`/customers/me/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function deleteAddressRequest(id: string) {
  await request(`/customers/me/addresses/${id}`, {
    method: 'DELETE',
  });
}

export async function setFavoriteAddress(data: { id: string; type: 'SHIPPING' | 'BILLING' }) {
  await request(`/customers/me/addresses/${data.id}/favorite`, {
    method: 'PATCH',
    body: JSON.stringify({
      type: data.type,
    }),
  });
}
