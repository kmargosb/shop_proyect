import { ApiErrorCode } from './error-codes';

type ApiErrorOptions = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  retryable?: boolean;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly retryable: boolean;

  constructor({ code, message, status, retryable = false, cause }: ApiErrorOptions) {
    super(message);

    this.name = 'ApiError';

    this.code = code;
    this.status = status;
    this.retryable = retryable;

    if (cause) {
      this.cause = cause;
    }

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
