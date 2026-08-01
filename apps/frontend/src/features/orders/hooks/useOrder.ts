import { useQuery } from '@tanstack/react-query';

import { fetchPaymentSummary, fetchPublicOrder } from '../orders.service';

export function useOrder(id: string, email?: string | null, enabled = true) {
  return useQuery({
    queryKey: ['payment-summary', id],

    queryFn: async () => {
      console.log('🔥 React Query ejecutando query');

      return email ? fetchPublicOrder(id, email) : fetchPaymentSummary(id);
    },

    enabled: !!id && enabled,

    retry: 1,

    retryDelay: 1000,
  });
}
