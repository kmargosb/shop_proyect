import { useQuery } from '@tanstack/react-query';

import { fetchOrder, fetchPublicOrder } from '../orders.service';

export function useOrder(id: string, email?: string | null) {
  return useQuery({
    queryKey: ['orders', id, email],

    queryFn: () => (email ? fetchPublicOrder(id, email) : fetchOrder(id)),

    enabled: !!id,
  });
}
