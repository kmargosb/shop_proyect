import { shouldRetry } from './retry';

export const queryDefaults = {
  queries: {
    retry: shouldRetry,

    retryDelay: (attemptIndex: number) => {
      switch (attemptIndex) {
        case 0:
          return 1000; // 1s

        case 1:
          return 3000; // 3s

        default:
          return 6000; // 6s
      }
    },

    staleTime: 5 * 60 * 1000, // 5 minutos

    gcTime: 15 * 60 * 1000, // 15 minutos

    refetchOnReconnect: true,

    refetchOnWindowFocus: false,

    refetchOnMount: false,

    networkMode: 'always' as const,
  },
};
