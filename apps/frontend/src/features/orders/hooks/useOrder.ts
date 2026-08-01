import { useQuery } from '@tanstack/react-query';

import { fetchOrder, fetchPublicOrder } from '../orders.service';

export function useOrder(id: string, email?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['orders', id, email],

    queryFn: () => (email ? fetchPublicOrder(id, email) : fetchOrder(id)),

    enabled: !!id && enabled,

    retry: 1,

    retryDelay: 1000,
  });
}
