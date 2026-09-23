import * as z from 'zod';

import { ERROR_CODES } from '@/features/core/error/error.handling';
import { AppError } from '@/features/core/error/error.AppError';

export function zodValidationOrThrow<T extends z.ZodTypeAny>(
  input: unknown,
  schema: T,
): z.output<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    console.error('Zod validation error:', result.error);
    throw new AppError(ERROR_CODES.BAD_REQUEST);
  }

  return result.data;
}
