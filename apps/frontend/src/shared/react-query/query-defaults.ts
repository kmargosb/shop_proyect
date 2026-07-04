import { ApiError } from '@/shared/api';

export const queryDefaults = {
  queries: {
    retry: (failureCount: number, error: unknown) => {
      if (!(error instanceof ApiError)) {
        return false;
      }

      if (!error.retryable) {
        return false;
      }

      return failureCount < 3;
    },

    retryDelay: (attemptIndex: number) => {
      return Math.min(1000 * 2 ** attemptIndex, 8000);
    },

    staleTime: 60 * 1000,

    gcTime: 5 * 60 * 1000,

    refetchOnReconnect: true,

    refetchOnWindowFocus: false,

    refetchOnMount: true,
  },
};
