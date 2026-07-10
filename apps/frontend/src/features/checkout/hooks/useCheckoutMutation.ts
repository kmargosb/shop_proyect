import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { checkout } from '../services/checkout.service';
import { mapCheckoutToApi } from '../lib/toCheckoutPayload';
import type { CheckoutSchema } from '../schemas/checkout.schema';

import { queryKeys } from '@/shared/react-query/query-keys';

export function useCheckoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutSchema) => checkout(mapCheckoutToApi(data)),

    async onSuccess(data, variables) {
      localStorage.setItem('orderEmail', variables.email);
      localStorage.setItem('orderEmailOrderId', data.orderId);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all,
      });

      router.push(
        `/orders/${data.orderId}/pay?clientSecret=${encodeURIComponent(
          data.payment.clientSecret,
        )}&email=${encodeURIComponent(variables.email)}`,
      );
    },

    onError(error: any) {
      toast.error(error?.message || 'Unable to process checkout');
    },
  });
}
