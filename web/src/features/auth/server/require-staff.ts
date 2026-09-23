import { headers } from 'next/headers';
import { auth } from '@/features/auth/auth';
import type { TAuthSession } from '@/features/auth/auth.types';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';

export async function requireStaffOrThrow(): Promise<
  NonNullable<TAuthSession>
> {
  const session: TAuthSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);
  if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
    throw new AppError(ERROR_CODES.FORBIDDEN);
  }

  return session;
}
