import { useQuery } from '@tanstack/react-query';

import { shouldRetry } from '@/shared/react-query/retry';

import { getAddresses } from '../addresses.service';

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ['account', 'addresses'],

    queryFn: getAddresses,

    enabled,

    placeholderData: (previousData) => previousData,

    retry: shouldRetry,
  });
}
