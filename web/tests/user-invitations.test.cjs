/* eslint-disable @typescript-eslint/no-require-imports -- Test invitation boundaries with isolated database and email fakes. */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const Module = require('node:module');
const { createHash } = require('node:crypto');
const {
  isVerifiedInvitationSignup,
} = require('../src/features/auth/invitation-signup.context.ts');
const load = Module._load;
let invitation,
  user,
  banned,
  permission,
  deliveryError,
  signupError,
  savedBeforeError;
let mails, signups;
class AppError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
const ERROR_CODES = Object.fromEntries(
  [
    'INVITATION_INVALID',
    'INVITATION_SEND_FAILED',
    'INVITATION_TOO_RECENT',
    'FORBIDDEN',
    'USER_ALREADY_EXISTS',
  ].map((code) => [code, code]),
);
const prisma = {
  user: { findUnique: async () => user },
  bannedEmail: { findUnique: async () => banned },
  userInvitation: {
    findUnique: async ({ where }) =>
      invitation &&
      (where.email === invitation.email ||
        where.tokenHash === invitation.tokenHash)
        ? { ...invitation }
        : null,
    upsert: async ({ create }) => {
      invitation = { id: 'invite', ...create };
      return invitation;
    },
    updateMany: async ({ where, data }) => {
      if (
        !invitation ||
        where.tokenHash !== invitation.tokenHash ||
        (where.email && where.email !== invitation.email) ||
        ('usedAt' in where && invitation.usedAt !== where.usedAt) ||
        (where.expiresAt && invitation.expiresAt <= where.expiresAt.gt)
      )
        return { count: 0 };
      Object.assign(invitation, data);
      return { count: 1 };
    },
    deleteMany: async ({ where }) => {
      if (invitation?.tokenHash === where.tokenHash) invitation = null;
    },
  },
};
Module._load = function (request, parent, isMain) {
  const stubs = {
    '@/lib/prisma/prisma': { prisma },
    'next/headers': { headers: async () => new Headers() },
    './auth': {
      auth: {
        api: {
          signUpEmail: async ({ body }) => {
            assert.equal(isVerifiedInvitationSignup(body.email), true);
            signups.push(body);
            if (savedBeforeError) user = { id: 'user' };
            if (signupError) throw signupError;
            user = { id: 'user', emailVerified: true };
          },
        },
      },
    },
    '@/features/core': { AppError, ERROR_CODES },
    '@/features/core/validation/zod-validation': {
      zodValidationOrThrow: (input, schema) => schema.parse(input),
    },
    '@/features/permission/lib/permission.service': {
      requireStaffPermissionOrThrow: async (name) => {
        assert.equal(name, 'canManageUsers');
        if (!permission) throw new AppError('FORBIDDEN');
        return { id: 'admin' };
      },
    },
    '@/features/mail/lib/auth-email.service': {
      sendAuthInvitationEmail: async (email, url) => {
        if (deliveryError) throw deliveryError;
        mails.push({ email, url });
      },
    },
    '@/features/mail/lib/email-layout': {
      getAppHomeUrl: () => 'https://example.com',
    },
  };
  return request in stubs
    ? stubs[request]
    : load.call(this, request, parent, isMain);
};
let service, repository;
try {
  service = require('../src/features/auth/invitation.service.ts');
  repository = require('../src/features/auth/invitation.repository.ts');
} finally {
  Module._load = load;
}
beforeEach(() => {
  invitation = user = banned = deliveryError = signupError = null;
  permission = true;
  savedBeforeError = false;
  mails = [];
  signups = [];
});
async function invite() {
  await service.sendInvitationService({ email: ' Invite@Example.com ' });
  return new URL(mails[0].url).searchParams.get('token');
}
function signup(token, email = 'invite@example.com') {
  return service.signUpWithInvitationService({
    token,
    email,
    name: 'Invité',
    password: 'Abcdef12!',
    confirmPassword: 'Abcdef12!',
    phone: '',
    legalTermsAccepted: true,
    canReceiveMarketingEmails: false,
  });
}
test('48h link, 256-bit token, normalized email and hash-only persistence', async () => {
  const start = Date.now();
  const token = await invite();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(invitation.email, 'invite@example.com');
  assert.equal(
    invitation.tokenHash,
    createHash('sha256').update(token).digest('hex'),
  );
  assert.equal(JSON.stringify(invitation).includes(token), false);
  assert.ok(invitation.expiresAt - start >= 48 * 60 * 60 * 1000);
  assert.ok(invitation.expiresAt - start < 48 * 60 * 60 * 1000 + 1000);
});
test('unauthorized staff, existing and banned users cannot be invited', async () => {
  permission = false;
  await assert.rejects(invite(), { code: 'FORBIDDEN' });
  permission = true;
  user = { id: 'existing' };
  await assert.rejects(invite(), { code: 'USER_ALREADY_EXISTS' });
  user = null;
  banned = { id: 'banned' };
  await assert.rejects(invite(), { code: 'FORBIDDEN' });
  assert.equal(mails.length, 0);
});
test('resend has a cooldown and invalidates the previous link', async () => {
  const old = await invite();
  await assert.rejects(invite(), { code: 'INVITATION_TOO_RECENT' });
  invitation.createdAt = new Date(Date.now() - 61000);
  await service.sendInvitationService({ email: 'invite@example.com' });
  assert.equal(await repository.getValidInvitation(old), null);
  assert.ok(
    await repository.getValidInvitation(
      new URL(mails[1].url).searchParams.get('token'),
    ),
  );
});
test('malformed, expired, used, wrong-email and newly banned links reject signup', async () => {
  const token = await invite();
  await assert.rejects(signup('bad'), { code: 'INVITATION_INVALID' });
  await assert.rejects(signup(token, 'other@example.com'), {
    code: 'INVITATION_INVALID',
  });
  const expiry = invitation.expiresAt;
  invitation.expiresAt = new Date(Date.now());
  await assert.rejects(signup(token), { code: 'INVITATION_INVALID' });
  invitation.expiresAt = expiry;
  invitation.usedAt = new Date();
  await assert.rejects(signup(token), { code: 'INVITATION_INVALID' });
  invitation.usedAt = null;
  banned = { id: 'ban' };
  await assert.rejects(signup(token), { code: 'INVITATION_INVALID' });
  assert.equal(signups.length, 0);
});
test('simultaneous signups consume the token once and preserve signup preferences', async () => {
  const token = await invite();
  const results = await Promise.allSettled([signup(token), signup(token)]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(signups.length, 1);
  assert.equal(signups[0].legalTermsAccepted, true);
  assert.equal(signups[0].canReceiveMarketingEmails, false);
  assert.equal(user.emailVerified, true);
  assert.equal(isVerifiedInvitationSignup('invite@example.com'), false);
  assert.equal('emailVerified' in signups[0], false);
  assert.equal('role' in signups[0], false);
});
test('failed creation releases the token, but a persisted account keeps it consumed', async () => {
  const token = await invite();
  signupError = new Error('signup failed');
  await assert.rejects(signup(token), /signup failed/);
  assert.equal(invitation.usedAt, null);
  savedBeforeError = true;
  await assert.rejects(signup(token), /signup failed/);
  assert.ok(invitation.usedAt);
});
test('failed invitation delivery removes the usable token', async () => {
  deliveryError = new Error('provider failure');
  await assert.rejects(invite(), { code: 'INVITATION_SEND_FAILED' });
  assert.equal(invitation, null);
});
test('CGU acceptance and matching passwords remain mandatory', async () => {
  const token = await invite();
  await assert.rejects(
    service.signUpWithInvitationService({
      token,
      email: 'invite@example.com',
      name: 'Invité',
      password: 'Abcdef12!',
      confirmPassword: 'Abcdef12!',
      legalTermsAccepted: false,
    }),
  );
  assert.equal(invitation.usedAt, null);
  assert.equal(signups.length, 0);
});
