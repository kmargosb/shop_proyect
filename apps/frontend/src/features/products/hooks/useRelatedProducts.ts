import { useQuery } from '@tanstack/react-query';

import type { Product } from '@/types/product';

import { shouldRetry } from '@/shared/react-query/retry';
import { queryKeys } from '@/shared/react-query/query-keys';

import { productsApi } from '../api/products.api';

export function useRelatedProducts(productId: string) {
  return useQuery<Product[]>({
    queryKey: queryKeys.products.related(productId),

    queryFn: () => productsApi.getRelated(productId),

    enabled: !!productId,

    placeholderData: (previousData) => previousData,

    retry: shouldRetry,
  });
}
