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

        const raw = await response.json();

        if (cancelled) return;

        /*
         * /orders/public/:id returns the complete order.
         * /payment-summary returns the already mapped payment summary.
         *
         * Normalize both responses into the same structure.
         */

        const normalized: PaymentSummaryResponse = {
          id: raw.id,
          currency: raw.currency,
          totalAmount: raw.totalAmount,

          items: (raw.items ?? []).map((item: any) => ({
            id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            size: item.size ?? null,
            color: item.color ?? null,

            image:
              item.image ||
              item.product?.images?.find((image: any) => image.isPrimary)?.url ||
              item.product?.images?.[0]?.url ||
              '',
          })),
        };

        setOrder(normalized);
      } catch (error) {
        console.error('Payment summary error:', error);

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
