import { request } from '@/shared/lib/request';

import type { Order } from './types';

export async function fetchMyOrders(): Promise<Order[]> {
  const response = await request('/orders/me');

  return response.json();
}
