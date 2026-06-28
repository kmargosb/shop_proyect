'use client';

import { useEffect } from 'react';
import { socket } from '@/shared/lib/socket';

export function useProductsLive(enabled: boolean, reload: () => void) {
  useEffect(() => {
    if (!enabled) return;

    socket.on('productUpdated', reload);

    return () => {
      socket.off('productUpdated', reload);
    };
  }, [enabled, reload]);
}
