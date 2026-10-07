import { prisma } from '@/lib/prisma/prisma';
import { hashInvitationToken, isInvitationToken } from './invitation-token';

export async function getValidInvitation(token: unknown) {
  if (!isInvitationToken(token)) return null;
  const invitation = await prisma.userInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
  });
  if (!invitation || invitation.usedAt || invitation.expiresAt <= new Date())
    return null;
  const [existingUser, bannedEmail] = await Promise.all([
    prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    }),
    prisma.bannedEmail.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    }),
  ]);
  return existingUser || bannedEmail ? null : invitation;
}

// Conditional write ensures only one concurrent signup can claim a link.
export async function claimInvitation(token: string, email: string) {
  const now = new Date();
  const result = await prisma.userInvitation.updateMany({
    where: {
      tokenHash: hashInvitationToken(token),
      email,
      usedAt: null,
      expiresAt: { gt: now },
    },
    data: { usedAt: now },
  });
  return result.count === 1;
}

export async function releaseInvitation(token: string) {
  await prisma.userInvitation.updateMany({
    where: { tokenHash: hashInvitationToken(token) },
    data: { usedAt: null },
  });
}
