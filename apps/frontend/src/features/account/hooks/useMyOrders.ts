import { useQuery } from '@tanstack/react-query';
import { fetchMyOrders } from '../account.service';
import { shouldRetry } from '@/shared/react-query/retry';
import type { Order } from '../types';

export function useMyOrders(enabled = true) {
  return useQuery<Order[]>({
    queryKey: ['orders', 'me'],
    queryFn: fetchMyOrders,
    enabled,
    placeholderData: (previousData) => previousData,
    retry: shouldRetry,
  });
}
