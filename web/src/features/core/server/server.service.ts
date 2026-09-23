import * as z from 'zod';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';

type ExecuteServiceWithoutPayload<TResult> = {
  serviceName: string;
  repositoryMethod: () => Promise<TResult>;
};

type ExecuteServiceWithPayload<TSchema extends z.ZodTypeAny, TResult> = {
  serviceName: string;
  data: unknown;
  zodSchema: TSchema;
  repositoryMethod: (data: z.output<TSchema>) => Promise<TResult>;
};

type ExecuteServiceProps<TSchema extends z.ZodTypeAny, TResult> =
  | ExecuteServiceWithoutPayload<TResult>
  | ExecuteServiceWithPayload<TSchema, TResult>;

export async function executeServiceOrThrow<
  TSchema extends z.ZodTypeAny,
  TResult,
>(props: ExecuteServiceProps<TSchema, TResult>): Promise<TResult> {
  try {
    if ('zodSchema' in props) {
      const parsedData = zodValidationOrThrow(props.data, props.zodSchema);
      return await props.repositoryMethod(parsedData);
    }
    return await props.repositoryMethod();
  } catch (error) {
    console.error(`Error in ${props.serviceName}:`, error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
