/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the service and repository without a database or active session. */
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const Module = require('node:module');
const { AppError } = require('../src/features/core/error/error.AppError.ts');
const {
  ERROR_CODES,
  isClassAppError,
} = require('../src/features/core/error/error.handling.ts');

let session;
let user;
let upcomingReservations;
let deletedIds;
let notifications;
const tx = {
  user: {
    findUnique: async ({ where }) => (where.id === user.id ? user : null),
    delete: async ({ where }) => {
      deletedIds.push(where.id);
      return { id: user.id, name: user.name, email: user.email };
    },
  },
  reservation: { count: async () => upcomingReservations },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  const stubs = {
    'next/headers': { headers: async () => new Headers() },
    './auth': { auth: { api: { getSession: async () => session } } },
    '@/features/core': { AppError, ERROR_CODES, isClassAppError },
    '@/features/permission/lib/permission.service': {},
    './server/require-staff': {},
    '@/features/core/validation/zod-validation': {},
    '@/lib/prisma/prisma': {
      prisma: { $transaction: async (fn) => fn(tx) },
    },
    '@/features/notifications/lib/notifications.service': {
      createAdminDeletedUserNotificationService: async (data) => {
        notifications.push(data);
      },
    },
  };
  return request in stubs
    ? stubs[request]
    : originalLoad.call(this, request, parent, isMain);
};
let deleteCurrentUserAccountService;
let deleteUserAccountInPrismaRepository;
try {
  ({
    deleteCurrentUserAccountService,
  } = require('../src/features/auth/auth.service.ts'));
  ({
    deleteUserAccountInPrismaRepository,
  } = require('../src/features/auth/auth.repository.ts'));
} finally {
  Module._load = originalLoad;
}

beforeEach(() => {
  user = {
    id: 'current-account',
    name: 'Current user',
    email: 'current@example.com',
    role: 'STAFF',
  };
  session = { user: { id: user.id, role: user.role } };
  upcomingReservations = 0;
  deletedIds = [];
  notifications = [];
});

for (const role of ['USER', 'MEMBER', 'STAFF']) {
  test(`${role} can delete their own account and notify administrators`, async () => {
    user.role = role;
    session.user.role = role;
    const result = await deleteCurrentUserAccountService();
    assert.equal(result.id, session.user.id);
    assert.deepEqual(deletedIds, [session.user.id]);
    assert.deepEqual(notifications, [
      { ...result, userId: session.user.id, deletedBy: 'USER' },
    ]);
  });
}

test('ADMIN cannot delete their own account', async () => {
  user.role = 'ADMIN';
  session.user.role = 'ADMIN';
  await assert.rejects(deleteCurrentUserAccountService(), {
    code: ERROR_CODES.ADMIN_ACCOUNT_PROTECTED,
  });
  assert.deepEqual(deletedIds, []);
  assert.deepEqual(notifications, []);
});

test('STAFF self-deletion remains blocked by upcoming reservations', async () => {
  upcomingReservations = 1;
  await assert.rejects(deleteCurrentUserAccountService(), {
    code: ERROR_CODES.USER_HAS_UPCOMING_RESERVATIONS,
  });
  assert.deepEqual(deletedIds, []);
  assert.deepEqual(notifications, []);
});

test('self-deletion requires an authenticated session', async () => {
  session = null;
  await assert.rejects(deleteCurrentUserAccountService(), {
    code: ERROR_CODES.UNAUTHORIZED,
  });
  assert.deepEqual(deletedIds, []);
});

test('the repository still rejects STAFF deletion without explicit authorization', async () => {
  await assert.rejects(
    deleteUserAccountInPrismaRepository({ userId: user.id }),
    { code: ERROR_CODES.STAFF_ACCOUNT_ADMIN_ONLY },
  );
  assert.deepEqual(deletedIds, []);
});
