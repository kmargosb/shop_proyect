import { QueryClient } from '@tanstack/react-query';

import { queryDefaults } from './query-defaults';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryDefaults,
  });
}
