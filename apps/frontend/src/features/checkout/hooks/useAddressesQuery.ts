import { useQuery } from '@tanstack/react-query';

import { fetchAddresses } from '../services/checkout.service';
import { queryKeys } from '@/shared/react-query/query-keys';

export function useAddressesQuery() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: fetchAddresses,
  });
}
