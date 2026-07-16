import { request } from '@/shared/lib/request';

export async function fetchOrder(id: string) {
  console.log('📦 Fetching order:', id);

  const response = await request(`/orders/${id}`);

  console.log('✅ Order response:', response.status);

  const data = await response.json();

  console.log('📦 Order loaded:', data);

  return data;
}

export async function fetchPublicOrder(id: string, email: string) {
  const response = await request(`/orders/public/${id}?email=${encodeURIComponent(email)}`, {
    auth: false,
  });

  return response.json();
}

export async function cancelOrder(id: string, reason: string) {
  const response = await request(`/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({
      reason,
    }),
  });

  return response.json();
}

export async function markRefundSent(refundId: string, carrier: string, trackingNumber: string) {
  const response = await request(`/refunds/${refundId}/sent`, {
    method: 'POST',
    body: JSON.stringify({
      carrier,
      trackingNumber,
    }),
  });

  return response.json();
}

export async function retryPayment(orderId: string) {
  const response = await request(`/api/payments/retry/${orderId}`, {
    method: 'POST',
  });

  return response.json();
}

export async function getOrder(id: string) {
  const response = await request(`/orders/${id}`);
  return response.json();
}

export async function getGuestOrder(id: string, email: string) {
  const response = await request(`/orders/public/${id}?email=${encodeURIComponent(email)}`, {
    auth: false,
  });

  return response.json();
}
