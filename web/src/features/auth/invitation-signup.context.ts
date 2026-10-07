import { AsyncLocalStorage } from 'node:async_hooks';

// Server-only proof supplied after atomically claiming a valid invitation.
// It is scoped to this signup, never to a client-supplied user field.
const verifiedInvitationEmail = new AsyncLocalStorage<string>();

export function withVerifiedInvitation<T>(
  email: string,
  signup: () => Promise<T>,
): Promise<T> {
  return verifiedInvitationEmail.run(email.trim().toLowerCase(), signup);
}

export function isVerifiedInvitationSignup(email: string): boolean {
  return verifiedInvitationEmail.getStore() === email.trim().toLowerCase();
}
