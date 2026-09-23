import { type TErrorCode } from '@/features/core/error/error.handling';
import { getErrorCodeFromError } from '@/features/core/error/error.handling';

export type TServerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: TErrorCode };

function success<T>(data: T): TServerResponse<T> {
  return {
    success: true,
    data,
  };
}

function failure(error: unknown): TServerResponse<never> {
  return {
    success: false,
    error: getErrorCodeFromError(error),
  };
}

export const ServerResponse = {
  success,
  failure,
};
