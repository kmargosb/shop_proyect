import { useQuery } from '@tanstack/react-query';
import { request } from '@/shared/lib/request';

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['payment-order', orderId],

    queryFn: async () => {
      const res = await request(`/orders/${orderId}`);

      return res.json();
    },

    enabled: !!orderId,
  });
}
