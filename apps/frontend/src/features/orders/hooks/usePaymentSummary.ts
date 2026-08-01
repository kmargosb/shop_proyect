import { useEffect, useState } from 'react';

import { apiFetch } from '@/shared/lib/api';
import type { PaymentSummaryResponse } from '@/types/order';

export function usePaymentSummary(orderId: string, email?: string | null) {
  const [order, setOrder] = useState<PaymentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(false);

        const endpoint = email
          ? `/orders/public/${orderId}?email=${encodeURIComponent(email)}`
          : `/orders/${orderId}/payment-summary`;

        const response = await apiFetch(endpoint);

        if (!response) {
          throw new Error('Failed to load payment summary');
        }

        const data: PaymentSummaryResponse = await response.json();

        if (!cancelled) {
          setOrder(data);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [orderId, email]);

  return {
    order,
    loading,
    error,
  };
}
