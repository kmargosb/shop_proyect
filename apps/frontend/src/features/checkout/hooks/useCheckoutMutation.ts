import { useMutation } from '@tanstack/react-query';
import { checkout } from '../services/checkout.service';

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: checkout,
  });
}
