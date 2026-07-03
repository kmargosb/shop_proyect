import { ApiErrorCode } from './error-codes';

type ApiErrorOptions = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  retryable?: boolean;
  details?: unknown;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor({ code, message, status, retryable = false, details, cause }: ApiErrorOptions) {
    super(message);

    this.name = 'ApiError';

    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.details = details;

    if (cause) {
      this.cause = cause;
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
