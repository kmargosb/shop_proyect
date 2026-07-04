import { ApiError } from '@/shared/api';

export function shouldRetry(failureCount: number, error: unknown): boolean {
  // Máximo 3 intentos
  if (failureCount >= 3) {
    return false;
  }

  // Si no conocemos el error, reintentamos
  if (!(error instanceof ApiError)) {
    return true;
  }

  // Solo reintentamos errores marcados como retryables
  return error.retryable;
}
