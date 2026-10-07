/* eslint-disable @typescript-eslint/no-require-imports -- Exercise actual auth hooks without database or email delivery. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const {
  withVerifiedInvitation,
  isVerifiedInvitationSignup,
} = require('../src/features/auth/invitation-signup.context.ts');
const originalLoad = Module._load;
const envKeys = ['BETTER_AUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const previousEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);
for (const key of envKeys)
  process.env[key] =
    key === 'BETTER_AUTH_URL' ? 'https://example.com' : 'test-only';
let emailSends = 0;
let banned = false;
class FakePrisma {
  bannedEmail = { findUnique: async () => (banned ? { id: 'banned' } : null) };
  legalTerms = { findFirst: async () => ({ id: 'terms' }) };
}
Module._load = function (request, parent, isMain) {
  const stubs = {
    'better-auth': {
      betterAuth: (config) => config,
      APIError: {
        from: (_status, body) => Object.assign(new Error(body.message), body),
      },
    },
    'better-auth/adapters/prisma': { prismaAdapter: () => ({}) },
    '@prisma/client': { PrismaClient: FakePrisma },
    '@/features/mail/lib/auth-email.service': {
      sendAuthVerificationEmail: async () => {
        emailSends++;
      },
      sendAuthResetPasswordEmail: async () => {},
    },
  };
  return request in stubs
    ? stubs[request]
    : originalLoad.call(this, request, parent, isMain);
};
let config;
try {
  config = require('../src/features/auth/auth.ts').auth;
} finally {
  Module._load = originalLoad;
  for (const key of envKeys) {
    if (previousEnv[key] === undefined) delete process.env[key];
    else process.env[key] = previousEnv[key];
  }
}
const user = {
  email: 'invite@example.com',
  emailVerified: false,
  legalTermsAccepted: true,
};
const signupHook = () =>
  config.databaseHooks.user.create.before(
    { ...user },
    { path: '/sign-up/email' },
  );

test('invitation creates a verified user and suppresses the second email', async () => {
  const result = await withVerifiedInvitation(user.email, signupHook);
  assert.equal(result.data.emailVerified, true);
  assert.equal(result.data.legalTermsAccepted, true);
  assert.equal(result.data.acceptedLegalTermsId, 'terms');
  emailSends = 0;
  await config.emailVerification.sendVerificationEmail({
    user: result.data,
    url: 'https://example.com/verify',
    token: 'test',
  });
  assert.equal(emailSends, 0);
  assert.equal(isVerifiedInvitationSignup(user.email), false);
});
test('classic signup still requires and sends email verification', async () => {
  const result = await signupHook();
  assert.equal(result.data.emailVerified, false);
  assert.equal(config.emailAndPassword.requireEmailVerification, true);
  assert.equal(config.emailVerification.sendOnSignUp, true);
  emailSends = 0;
  await config.emailVerification.sendVerificationEmail({
    user: result.data,
    url: 'https://example.com/verify',
    token: 'test',
  });
  assert.equal(emailSends, 1);
});
test('invitation proof is isolated from concurrent ordinary signups and other emails', async () => {
  const results = await Promise.all([
    withVerifiedInvitation(user.email, async () => {
      await new Promise((resolve) => setImmediate(resolve));
      return signupHook();
    }),
    signupHook(),
    withVerifiedInvitation('other@example.com', signupHook),
  ]);
  assert.deepEqual(
    results.map((result) => result.data.emailVerified),
    [true, false, false],
  );
});
test('client-supplied invitation flags never verify a classic signup', async () => {
  const result = await config.databaseHooks.user.create.before(
    { ...user, invitationVerified: true },
    {
      path: '/sign-up/email',
      body: { invitationVerified: true, emailVerified: true },
    },
  );
  assert.equal(result.data.emailVerified, false);
});
test('invitation never bypasses legal terms or banned-email protection', async () => {
  await assert.rejects(
    withVerifiedInvitation(user.email, () =>
      config.databaseHooks.user.create.before(
        { ...user, legalTermsAccepted: false },
        { path: '/sign-up/email' },
      ),
    ),
    { code: 'LEGAL_TERMS_REQUIRED' },
  );
  banned = true;
  try {
    await assert.rejects(withVerifiedInvitation(user.email, signupHook), {
      code: 'EMAIL_BANNED',
    });
  } finally {
    banned = false;
  }
});

test('actual Better Auth signup and signin accept invitations without a verification email', async () => {
  const { betterAuth } = await import('better-auth');
  const { memoryAdapter } = await import('better-auth/adapters/memory');
  const db = { user: [], account: [], session: [], verification: [] };
  const isolatedAuth = betterAuth({
    ...config,
    baseURL: 'http://localhost:3000',
    secret: 'test-only-secret-with-at-least-thirty-two-characters',
    database: memoryAdapter(db),
    socialProviders: {},
    databaseHooks: {
      user: { create: { before: config.databaseHooks.user.create.before } },
    },
  });
  const body = {
    email: user.email,
    name: 'Invité',
    password: 'Abcdef12!',
    legalTermsAccepted: true,
    canReceiveMarketingEmails: false,
  };
  emailSends = 0;
  const invited = await withVerifiedInvitation(user.email, () =>
    isolatedAuth.api.signUpEmail({ body }),
  );
  assert.equal(invited.user.emailVerified, true);
  assert.equal(emailSends, 0);
  const session = await isolatedAuth.api.signInEmail({
    body: { email: user.email, password: body.password },
  });
  assert.ok(session.token);
  assert.equal(session.user.emailVerified, true);
  const ordinary = await isolatedAuth.api.signUpEmail({
    body: { ...body, email: 'classic@example.com' },
  });
  assert.equal(ordinary.user.emailVerified, false);
  assert.equal(emailSends, 1);
  await assert.rejects(
    isolatedAuth.api.signInEmail({
      body: { email: 'classic@example.com', password: body.password },
    }),
  );
});
