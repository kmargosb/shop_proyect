import { ApiError, ApiErrorCode, createApiError, type ApiFetchOptions } from '@/shared/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/* ============================================
   PRIVATE EXECUTE FETCH
============================================ */

async function executeFetch(endpoint: string, options: ApiFetchOptions): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const isJSONBody = fetchOptions.body && !(fetchOptions.body instanceof FormData);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        ...(isJSONBody && {
          'Content-Type': 'application/json',
        }),
        ...(fetchOptions.headers ?? {}),
      },
    });

    return response;
  } catch (error) {
    throw await createApiError(undefined, error);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ============================================
   REFRESH TOKEN
============================================ */

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await executeFetch('/auth/refresh', {
      method: 'POST',
      auth: false,
    });

    return response.ok;
  } catch {
    return false;
  }
}

/* ============================================
   MAIN REQUEST
============================================ */

export async function request(endpoint: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, ...requestOptions } = options;

  let response = await executeFetch(endpoint, requestOptions);

  if (auth && response.status === 401 && !endpoint.startsWith('/auth/refresh')) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      throw await createApiError(response);
    }

    response = await executeFetch(endpoint, requestOptions);
  }

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response;
}
