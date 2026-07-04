import { useQuery } from '@tanstack/react-query';

import { shouldRetry } from '@/shared/react-query/retry';

import { fetchCurrentUser } from '../auth.service';

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],

    queryFn: fetchCurrentUser,

    enabled,

    retry: shouldRetry,

    staleTime: 5 * 60 * 1000,

    gcTime: 15 * 60 * 1000,
  });
}
