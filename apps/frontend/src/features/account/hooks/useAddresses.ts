import { useQuery } from '@tanstack/react-query';

import { shouldRetry } from '@/shared/react-query/retry';
import type { Address } from '../types';
import { getAddresses } from '../addresses.service';

export function useAddresses(enabled = true) {
  return useQuery<Address[]>({
    queryKey: ['account', 'addresses'],

    queryFn: getAddresses,

    enabled,

    placeholderData: (previousData) => previousData,

    retry: shouldRetry,
  });
}
