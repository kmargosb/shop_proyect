'use client';

import { ApiError, ApiErrorCode } from '@/shared/api';

type Props = {
  error: unknown;
  onRetry: () => void;
};

export default function QueryErrorState({ error, onRetry }: Props) {
  let title = 'Something went wrong';
  let description = 'Please try again.';

  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.OFFLINE:
        title = 'You are offline';
        description = 'Check your internet connection and try again.';
        break;

      case ApiErrorCode.TIMEOUT:
        title = 'The server is taking too long';
        description = 'We are still trying to reach the server.';
        break;

      case ApiErrorCode.NETWORK:
        title = 'Connection problem';
        description = 'Unable to reach the server.';
        break;

      case ApiErrorCode.SERVER:
        title = 'Server unavailable';
        description = 'The server is temporarily unavailable.';
        break;

      case ApiErrorCode.NOT_FOUND:
        title = 'Nothing found';
        description = 'The requested resource does not exist.';
        break;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-3 max-w-md text-sm text-neutral-500">{description}</p>

      <button
        onClick={onRetry}
        className="mt-6 rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
