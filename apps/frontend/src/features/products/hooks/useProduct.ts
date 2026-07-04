import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/react-query/query-keys';
import { productsApi } from '../api/products.api';
import { shouldRetry } from '@/shared/react-query/retry';

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),

    queryFn: () => productsApi.getById(id),

    enabled: !!id,

    placeholderData: (previousData) => previousData,

    retry: shouldRetry,
  });
}
