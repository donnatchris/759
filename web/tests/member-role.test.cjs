/* eslint-disable @typescript-eslint/no-require-imports -- Mock the database before loading the repository. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const {
  updateUsersRoleSchema,
} = require('../src/features/auth/auth.schema.ts');
const { ERROR_CODES } = require('../src/features/core/error/error.handling.ts');
const ids = ['account-user', 'account-staff'];
let users;
let permissions;
const tx = {
  user: {
    findMany: async () => users,
    updateMany: async ({ where, data }) => {
      let count = 0;
      users = users.map((user) => {
        if (where.id.in.includes(user.id) && user.role !== where.role.not) {
          count++;
          return { ...user, ...data };
        }
        return user;
      });
      return { count };
    },
  },
  staffPermission: {
    deleteMany: async ({ where }) => {
      permissions = permissions.filter((id) => !where.userId.in.includes(id));
    },
  },
};
const originalLoad = Module._load;
let updateUsersRoleInPrismaRepository;
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') {
    return { prisma: { $transaction: async (fn) => fn(tx) } };
  }
  return originalLoad.call(this, request, parent, isMain);
};
try {
  ({
    updateUsersRoleInPrismaRepository,
  } = require('../src/features/auth/auth.repository.ts'));
} finally {
  Module._load = originalLoad;
}

test('bulk role validation accepts MEMBER and rejects ADMIN and unknown roles', () => {
  for (const role of ['USER', 'MEMBER', 'STAFF']) {
    assert.equal(
      updateUsersRoleSchema.safeParse({ userIds: ids, role }).success,
      true,
    );
  }
  for (const role of ['ADMIN', 'UNKNOWN']) {
    assert.equal(
      updateUsersRoleSchema.safeParse({ userIds: ids, role }).success,
      false,
    );
  }
});

test('bulk conversion to MEMBER updates ordinary and staff accounts and clears staff permissions', async () => {
  users = [
    { id: ids[0], role: 'USER' },
    { id: ids[1], role: 'STAFF' },
  ];
  permissions = [ids[1], 'other-staff'];
  const result = await updateUsersRoleInPrismaRepository({
    userIds: ids,
    role: 'MEMBER',
  });
  assert.deepEqual(
    result,
    ids.map((id) => ({ id, role: 'MEMBER' })),
  );
  assert.deepEqual(permissions, ['other-staff']);
});

test('an administrator in the selection prevents all role changes', async () => {
  users = [
    { id: ids[0], role: 'USER' },
    { id: ids[1], role: 'ADMIN' },
  ];
  permissions = [ids[1]];
  await assert.rejects(
    updateUsersRoleInPrismaRepository({ userIds: ids, role: 'MEMBER' }),
    { code: ERROR_CODES.ADMIN_ROLE_PROTECTED },
  );
  assert.deepEqual(
    users.map((user) => user.role),
    ['USER', 'ADMIN'],
  );
  assert.deepEqual(permissions, [ids[1]]);
});
