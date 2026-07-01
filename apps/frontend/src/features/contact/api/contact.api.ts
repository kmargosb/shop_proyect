import { apiFetch } from '@/shared/lib/api';
import type { ContactRequest } from '../types';

export const contactApi = {
  async send(data: ContactRequest) {
    return apiFetch('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
