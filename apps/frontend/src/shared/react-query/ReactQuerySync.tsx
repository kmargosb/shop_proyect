'use client';

import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { socket } from '@/shared/lib/socket';

import { queryKeys } from './query-keys';

export default function ReactQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleProductUpdated = () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
    };

    socket.on('productUpdated', handleProductUpdated);

    return () => {
      socket.off('productUpdated', handleProductUpdated);
    };
  }, [queryClient]);

  return null;
}
