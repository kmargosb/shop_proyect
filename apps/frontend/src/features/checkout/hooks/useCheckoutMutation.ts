import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { checkout } from '../services/checkout.service';
import type { CheckoutSchema } from '../schemas/checkout.schema';

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: (data: CheckoutSchema) =>
      checkout({
        method: 'CARD',

        fullName: `${data.firstName} ${data.lastName}`.trim(),

        email: data.email,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      }),

    onSuccess(data, variables) {
      localStorage.setItem('orderEmail', variables.email);

      localStorage.setItem('orderEmailOrderId', data.orderId);

      window.location.href = `/orders/${data.orderId}/pay?clientSecret=${encodeURIComponent(
        data.payment.clientSecret,
      )}&email=${encodeURIComponent(variables.email)}`;
    },

    onError(error: any) {
      toast.error(error?.message || 'Unable to process checkout');
    },
  });
}
