import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { checkout } from '../services/checkout.service';
import { mapCheckoutToApi } from '../lib/toCheckoutPayload';
import type { CheckoutSchema } from '../schemas/checkout.schema';

import { queryKeys } from '@/shared/react-query/query-keys';

type ClearCart = () => void;

export function useCheckoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CheckoutSchema; clearCart: ClearCart }) =>
      checkout(mapCheckoutToApi(data)),

    async onSuccess(data, variables) {
      /*
       * La orden ya fue creada correctamente en el backend.
       * A partir de aquí el carrito frontend puede limpiarse
       * de forma segura.
       */

      localStorage.setItem('orderEmail', variables.data.email);
      localStorage.setItem('orderEmailOrderId', data.orderId);

      variables.clearCart();

      /*
       * También invalidamos la información del carrito en React Query
       * para evitar que alguna parte de la aplicación conserve datos
       * antiguos.
       */
      await queryClient.invalidateQueries({
        queryKey: queryKeys.cart.all,
      });

      const paymentUrl = `/orders/${data.orderId}/pay?clientSecret=${encodeURIComponent(
        data.payment.clientSecret,
      )}&email=${encodeURIComponent(variables.data.email)}`;

      router.prefetch(paymentUrl);

      router.push(paymentUrl);
    },

    onError(error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to process checkout';

      toast.error(message);
    },
  });
}
