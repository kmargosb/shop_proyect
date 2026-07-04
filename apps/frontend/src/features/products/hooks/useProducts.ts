import { useQuery } from '@tanstack/react-query';

import type { Product } from '@/types/product';

import { queryKeys } from '@/shared/react-query/query-keys';
import { shouldRetry } from '@/shared/react-query/retry';

import { productsApi } from '../api/products.api';

type UseProductsOptions = {
  queryString: string;
  enabled?: boolean;
  initialData?: Product[];
};

export function useProducts({ queryString, enabled = true, initialData }: UseProductsOptions) {
  return useQuery({
    queryKey: queryKeys.products.list(queryString),

    queryFn: () => productsApi.search(queryString),

    enabled,

    initialData,

    placeholderData: (previousData) => previousData,

    retry: shouldRetry,
  });
}
