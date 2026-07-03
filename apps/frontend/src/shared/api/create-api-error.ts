import { ApiError } from './api-error';
import { ApiErrorCode } from './error-codes';

export async function createApiError(response?: Response, cause?: unknown): Promise<ApiError> {
  /* ============================
     NETWORK / FETCH ERRORS
  ============================ */

  if (!response) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return new ApiError({
        code: ApiErrorCode.OFFLINE,
        message: 'The device is offline.',
        retryable: true,
        cause,
      });
    }

    if (cause instanceof DOMException && cause.name === 'AbortError') {
      return new ApiError({
        code: ApiErrorCode.TIMEOUT,
        message: 'The request timed out.',
        retryable: true,
        cause,
      });
    }

    if (cause instanceof TypeError) {
      return new ApiError({
        code: ApiErrorCode.NETWORK,
        message: 'Network request failed.',
        retryable: true,
        cause,
      });
    }

    return new ApiError({
      code: ApiErrorCode.UNKNOWN,
      message: 'Unknown network error.',
      retryable: true,
      cause,
    });
  }

  /* ============================
     TRY READ RESPONSE BODY
  ============================ */

  let details: unknown;

  try {
    details = await response.clone().json();
  } catch {
    details = undefined;
  }

  /* ============================
     HTTP STATUS
  ============================ */

  switch (response.status) {
    case 400:
      return new ApiError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Bad request.',
        status: 400,
        retryable: false,
        details,
      });

    case 401:
      return new ApiError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Unauthorized.',
        status: 401,
        retryable: false,
        details,
      });

    case 403:
      return new ApiError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Forbidden.',
        status: 403,
        retryable: false,
        details,
      });

    case 404:
      return new ApiError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Resource not found.',
        status: 404,
        retryable: false,
        details,
      });

    case 409:
      return new ApiError({
        code: ApiErrorCode.CONFLICT,
        message: 'Conflict.',
        status: 409,
        retryable: false,
        details,
      });

    case 422:
      return new ApiError({
        code: ApiErrorCode.VALIDATION,
        message: 'Validation failed.',
        status: 422,
        retryable: false,
        details,
      });

    default:
      if (response.status >= 500) {
        return new ApiError({
          code: ApiErrorCode.SERVER,
          message: 'Server error.',
          status: response.status,
          retryable: true,
          details,
        });
      }

      return new ApiError({
        code: ApiErrorCode.UNKNOWN,
        message: 'Unexpected API error.',
        status: response.status,
        retryable: false,
        details,
      });
  }
}
