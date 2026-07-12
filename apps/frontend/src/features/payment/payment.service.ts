import { request } from '@/shared/lib/request';

export async function fetchPaymentSummary(orderId: string) {
  const res = await request(`/orders/${orderId}/payment-summary`);

  if (!res.ok) {
    throw new Error('Failed to load payment summary');
  }

  return res.json();
}
