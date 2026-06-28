import { serverFetch } from '../client';

export async function getCurrentUser() {
  return serverFetch<{
    user: {
      id: string;
      email: string;
      role: 'ADMIN' | 'CUSTOMER';
      name?: string | null;
    } | null;
  }>('/auth/me');
}
