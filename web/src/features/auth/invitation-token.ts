import { createHash, randomBytes } from 'node:crypto';

export const INVITATION_LIFETIME_MS = 48 * 60 * 60 * 1000;

export function createInvitationToken() {
  return randomBytes(32).toString('hex');
}

export function hashInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function isInvitationToken(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);
}
