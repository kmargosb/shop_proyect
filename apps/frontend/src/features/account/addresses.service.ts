import { request } from '@/shared/lib/request';

export async function getAddresses() {
  const response = await request('/customers/me/addresses');

  return response.json();
}

export async function createAddress(data: unknown) {
  const response = await request('/customers/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateAddress(id: string, data: unknown) {
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

export async function setFavoriteAddress(id: string) {
  await request(`/customers/me/addresses/${id}/favorite`, {
    method: 'PATCH',
  });
}
