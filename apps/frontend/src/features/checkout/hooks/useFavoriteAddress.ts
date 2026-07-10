import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setFavoriteAddress } from '../services/checkout.service';
import { queryKeys } from '@/shared/react-query/query-keys';

export function useFavoriteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setFavoriteAddress,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.addresses.all,
      });
    },
  });
}
