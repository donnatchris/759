import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from './auth';
import { signUpFormSchema } from './auth.schema';
import { withVerifiedInvitation } from './invitation-signup.context';
import { AppError, ERROR_CODES } from '@/features/core';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import { requireStaffPermissionOrThrow } from '@/features/permission/lib/permission.service';
import { prisma } from '@/lib/prisma/prisma';
import { sendAuthInvitationEmail } from '@/features/mail/lib/auth-email.service';
import { getAppHomeUrl } from '@/features/mail/lib/email-layout';
import {
  claimInvitation,
  getValidInvitation,
  releaseInvitation,
} from './invitation.repository';
import {
  createInvitationToken,
  hashInvitationToken,
  INVITATION_LIFETIME_MS,
  isInvitationToken,
} from './invitation-token';

export async function sendInvitationService(input: unknown) {
  const inviter = await requireStaffPermissionOrThrow('canManageUsers');
  const { email } = zodValidationOrThrow(
    input,
    z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }),
  );
  const [existingUser, bannedEmail, previous] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.bannedEmail.findUnique({ where: { email }, select: { id: true } }),
    prisma.userInvitation.findUnique({ where: { email } }),
  ]);
  if (bannedEmail) throw new AppError(ERROR_CODES.FORBIDDEN);
  if (existingUser) throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS);
  const now = new Date();
  if (previous && now.getTime() - previous.createdAt.getTime() < 60_000) {
    throw new AppError(ERROR_CODES.INVITATION_TOO_RECENT);
  }
  const token = createInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const data = {
    tokenHash,
    expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
    usedAt: null,
    invitedByUserId: inviter.id,
    createdAt: now,
  };
  await prisma.userInvitation.upsert({
    where: { email },
    create: { email, ...data },
    update: data,
  });
  const url = new URL('/auth/invitation', getAppHomeUrl());
  url.searchParams.set('token', token);
  try {
    await sendAuthInvitationEmail(email, url.toString());
  } catch {
    // A failed delivery must never leave a usable link behind.
    await prisma.userInvitation.deleteMany({ where: { tokenHash } });
    throw new AppError(ERROR_CODES.INVITATION_SEND_FAILED);
  }
  return { email, expiresAt: data.expiresAt.toISOString() };
}

export async function signUpWithInvitationService(input: unknown) {
  const { token, ...formData } = zodValidationOrThrow(
    input,
    z.object({ token: z.string() }).and(signUpFormSchema),
  );
  if (!isInvitationToken(token))
    throw new AppError(ERROR_CODES.INVITATION_INVALID);
  const invitation = await getValidInvitation(token);
  const email = formData.email.trim().toLowerCase();
  if (
    !invitation ||
    invitation.email !== email ||
    !(await claimInvitation(token, email))
  ) {
    throw new AppError(ERROR_CODES.INVITATION_INVALID);
  }
  try {
    const requestHeaders = await headers();
    await withVerifiedInvitation(email, () =>
      auth.api.signUpEmail({
        headers: requestHeaders,
        body: {
          name: formData.name,
          email,
          password: formData.password,
          phone: formData.phone ?? undefined,
          canReceiveMarketingEmails: formData.canReceiveMarketingEmails,
          legalTermsAccepted: formData.legalTermsAccepted,
        },
      }),
    );
  } catch (error) {
    // Keep the invitation consumed if an account was persisted before failure;
    // otherwise permit a retry.
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) await releaseInvitation(token);
    throw error;
  }
  return { email };
}
