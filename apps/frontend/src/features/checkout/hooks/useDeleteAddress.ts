import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAddress } from '../services/checkout.service';
import { queryKeys } from '@/shared/react-query/query-keys';

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.addresses.all,
      });
    },
  });
}
