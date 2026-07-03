import { request } from '@/shared/lib/request';
import { ApiError, ApiErrorCode } from '@/shared/api';

export async function fetchCurrentUser() {
  try {
    const response = await request('/auth/me');

    const data = await response.json();

    return data.user ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.code === ApiErrorCode.UNAUTHORIZED) {
      return null;
    }

    throw error;
  }
}
