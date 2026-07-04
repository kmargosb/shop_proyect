'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/react-query';
import ReactQuerySync from '@/shared/react-query/ReactQuerySync';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={client}>
      <ReactQuerySync />
      {children}
    </QueryClientProvider>
  );
}
