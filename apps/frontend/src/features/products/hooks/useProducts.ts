import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/react-query/query-keys';
import { productsApi } from '../api/products.api';
import { shouldRetry } from '@/shared/react-query/retry';

type UseProductsOptions = {
  queryString: string;
  enabled?: boolean;
};

export function useProducts({ queryString, enabled = true }: UseProductsOptions) {
  return useQuery({
    queryKey: queryKeys.products.list(queryString),
    queryFn: () => productsApi.search(queryString),
    enabled,

    /**
     * Mantiene los datos anteriores mientras cambia
     * el queryString (búsqueda, filtros, etc.)
     */
    placeholderData: (previousData) => previousData,
    retry: shouldRetry,
  });
}
