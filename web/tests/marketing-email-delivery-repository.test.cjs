/* eslint-disable @typescript-eslint/no-require-imports -- Inspect atomic database guards without contacting production. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const originalLoad = Module._load;
let updateArgs;
let readArgs;
let count = 1;
const prisma = {
  marketingEmail: {
    updateMany: async (args) => {
      updateArgs = args;
      return { count };
    },
    findFirst: async (args) => {
      readArgs = args;
      return { id: args.where.id, sendLeaseToken: args.where.sendLeaseToken };
    },
    findMany: async (args) => {
      readArgs = args;
      return [];
    },
  },
};
let repository;
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') return { prisma };
  return originalLoad.call(this, request, parent, isMain);
};
try {
  repository = require('../src/features/mail/lib/marketing-email.delivery-repository.ts');
} finally {
  Module._load = originalLoad;
}

test('claim atomically excludes active leases and review-blocked campaigns', async () => {
  const row =
    await repository.claimMarketingEmailSendAttemptInPrismaRepository(
      'campaign',
    );
  assert.equal(updateArgs.where.requiresReview, false);
  assert.deepEqual(updateArgs.where.consecutiveFailures, { lt: 3 });
  const alternatives = updateArgs.where.AND[1].OR;
  assert.deepEqual(alternatives[0], { status: { in: ['PENDING', 'FAILED'] } });
  assert.equal(alternatives[1].status, 'SENDING');
  assert.ok(alternatives[1].sendLeaseExpiresAt.lte instanceof Date);
  assert.equal(updateArgs.data.status, 'SENDING');
  assert.equal(
    updateArgs.data.sendLeaseExpiresAt - updateArgs.data.emailLastAttemptAt,
    120000,
  );
  assert.equal(readArgs.where.sendLeaseToken, row.sendLeaseToken);
});

test('lost atomic claim does not read or process the campaign', async () => {
  count = 0;
  readArgs = null;
  assert.equal(
    await repository.claimMarketingEmailSendAttemptInPrismaRepository(
      'campaign',
    ),
    null,
  );
  assert.equal(readArgs, null);
  count = 1;
});

test('every checkpoint checks token and unexpired lease; stale worker is rejected', async () => {
  await repository.checkpointMarketingEmail('campaign', 'worker-a', {
    nextBatchIndex: 2,
    sentRecipientCount: 200,
  });
  assert.equal(updateArgs.where.sendLeaseToken, 'worker-a');
  assert.equal(updateArgs.where.status, 'SENDING');
  assert.ok(updateArgs.where.sendLeaseExpiresAt.gt instanceof Date);
  assert.equal(updateArgs.data.sentRecipientCount, 200);
  count = 0;
  await assert.rejects(
    repository.checkpointMarketingEmail('campaign', 'old-worker', {
      status: 'SENT',
    }),
    repository.MarketingEmailLeaseLostError,
  );
  count = 1;
});

test('selection respects deferred retries and scheduled date', async () => {
  const date = new Date();
  await repository.getMarketingEmailsToSendFromPrismaRepository({
    limit: 20,
    scheduledForLte: date,
  });
  assert.equal(readArgs.where.scheduledFor.lte, date);
  assert.equal(readArgs.take, 20);
  assert.equal(readArgs.where.AND[0].OR[0].nextAttemptAt, null);
  assert.ok(readArgs.where.AND[0].OR[1].nextAttemptAt.lte instanceof Date);
});
