import { apiFetch } from '@/shared/lib/api';

export async function fetchCurrentUser() {
  const res = await apiFetch('/auth/me');

  if (!res || !res.ok) {
    return null;
  }

  const data = await res.json();

  return data.user ?? null;
}
