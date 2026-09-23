import { Prisma } from '@prisma/client';

export function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

function hasCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

function hasMessageContaining(error: unknown, text: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message
      .toLowerCase()
      .includes(text.toLowerCase())
  );
}

function isPrismaUniqueConstraintOnField(
  error: unknown,
  field: string,
): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes(field);
  }

  if (typeof target === 'string') {
    return target.includes(field);
  }

  return false;
}

export function isUserAlreadyExistsError(error: unknown): boolean {
  return (
    isPrismaUniqueConstraintOnField(error, 'email') ||
    hasCode(error, 'USER_ALREADY_EXISTS') ||
    hasCode(error, 'EMAIL_ALREADY_EXISTS') ||
    hasMessageContaining(error, 'already exists') ||
    hasMessageContaining(error, 'email already')
  );
}

export function isInvalidCredentialsError(error: unknown): boolean {
  return (
    hasCode(error, 'INVALID_EMAIL_OR_PASSWORD') ||
    hasCode(error, 'INVALID_CREDENTIALS') ||
    hasMessageContaining(error, 'invalid email or password') ||
    hasMessageContaining(error, 'invalid credentials')
  );
}
