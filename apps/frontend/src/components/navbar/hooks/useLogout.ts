'use client';

import { apiFetch } from '@/shared/lib/api';

export function useLogout() {
  return async () => {
    await apiFetch('/auth/logout', {
      method: 'POST',
    });

    localStorage.removeItem('orderEmail');
    localStorage.removeItem('orderEmailOrderId');
    localStorage.removeItem('checkoutData');

    window.location.href = '/';
  };
}
