/* eslint-disable @typescript-eslint/no-require-imports -- Exercise delivery with fake persistence and transport. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  deliverMarketingEmail,
  retryDelayMs,
} = require('../src/features/mail/lib/marketing-email.delivery.ts');

function harness(size = 1500) {
  let now = Date.parse('2026-10-04T10:00:00Z');
  let nextSlot = now;
  const state = {
    id: 'campaign',
    snapshot: {
      from: 'team@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      recipients: Array.from({ length: size }, (_, i) => `${i}@example.com`),
    },
    nextBatchIndex: 0,
    sentRecipientCount: 0,
    batchAttemptedAt: null,
  };
  const calls = [];
  const deps = {
    now: () => now,
    sleep: async (ms) => {
      now += ms;
    },
    reserveSlot: async () => {
      const slot = Math.max(now, nextSlot);
      nextSlot = slot + 1000;
      return new Date(slot);
    },
    checkpoint: async (data) => {
      Object.assign(state, data);
    },
    send: async (messages, key, timeoutMs) => {
      calls.push({ messages, key, at: now, timeoutMs });
      return {
        data: { data: messages.map((_, i) => ({ id: `mail-${i}` })) },
        error: null,
      };
    },
  };
  return {
    state,
    deps,
    calls,
    advance: (ms) => {
      now += ms;
    },
    run: (budget = 40000) =>
      deliverMarketingEmail({ ...state }, now + budget, deps),
  };
}

test('1500 recipients: 15 sequential paced requests, checkpoint every batch', async () => {
  const h = harness();
  const result = await h.run();
  assert.equal(result.status, 'SENT');
  assert.equal(result.sentRecipientCount, 1500);
  assert.equal(h.calls.length, 15);
  assert.ok(
    h.calls.every(
      (call) => call.messages.length === 100 && call.timeoutMs === 15000,
    ),
  );
  assert.ok(
    h.calls.slice(1).every((call, i) => call.at - h.calls[i].at >= 1000),
  );
  assert.equal(h.state.nextBatchIndex, 15);
  assert.equal(h.state.batchAttemptedAt, null);
});

test('429 respects Retry-After and replays precisely the same key and payload', async () => {
  const h = harness(100);
  const send = h.deps.send;
  let calls = 0;
  h.deps.send = async (...args) => {
    const success = await send(...args);
    return calls++ === 0
      ? {
          data: null,
          error: {
            name: 'rate_limit_exceeded',
            statusCode: 429,
            message: 'Slow down',
          },
          headers: { 'retry-after': '3' },
        }
      : success;
  };
  assert.equal((await h.run()).status, 'SENT');
  assert.equal(h.calls[1].at - h.calls[0].at, 3000);
  assert.equal(h.calls[1].key, h.calls[0].key);
  assert.deepEqual(h.calls[1].messages, h.calls[0].messages);
});

test('partial failure preserves the 700 accepted recipients and resumes at batch 8', async () => {
  const h = harness();
  const send = h.deps.send;
  h.deps.send = async (...args) =>
    h.state.nextBatchIndex === 7
      ? {
          data: null,
          error: {
            name: 'rate_limit_exceeded',
            statusCode: 429,
            message: 'Slow down',
          },
          headers: { 'retry-after': '60' },
        }
      : send(...args);
  const result = await h.run();
  assert.equal(result.status, 'PENDING');
  assert.equal(result.sentRecipientCount, 700);
  assert.equal(h.state.sentRecipientCount, 700);
  assert.equal(h.state.nextBatchIndex, 7);
  assert.equal(h.state.batchAttemptedAt, null);
  assert.equal(result.nextAttemptAt.getTime() - h.deps.now(), 60000);
  h.advance(60000);
  h.deps.send = send;
  assert.equal((await h.run()).status, 'SENT');
  assert.equal(h.calls.length, 15);
  assert.equal(h.calls[7].key, 'marketing-email-campaign-batch-7');
});

test('database crash after acceptance replays same batch, without losing earlier checkpoints', async () => {
  const h = harness(250);
  const checkpoint = h.deps.checkpoint;
  h.deps.checkpoint = async (data) => {
    if (data.nextBatchIndex === 2) throw new Error('database offline');
    return checkpoint(data);
  };
  await assert.rejects(h.run(), /database offline/);
  assert.equal(h.state.sentRecipientCount, 100);
  assert.equal(h.state.nextBatchIndex, 1);
  assert.ok(h.state.batchAttemptedAt);
  h.advance(120000);
  h.deps.checkpoint = checkpoint;
  assert.equal((await h.run()).status, 'SENT');
  assert.equal(h.calls[1].key, h.calls[2].key);
  assert.deepEqual(h.calls[1].messages, h.calls[2].messages);
  assert.equal(h.calls[3].messages.length, 50);
});

test('ambiguous batch older than replay window blocks instead of duplicating', async () => {
  const h = harness(100);
  h.state.batchAttemptedAt = new Date(h.deps.now() - 24 * 3600000);
  const result = await h.run();
  assert.equal(result.status, 'FAILED');
  assert.equal(result.requiresReview, true);
  assert.equal(h.calls.length, 0);
});

test('confirmed batches remain skipped after the idempotency cache expires', async () => {
  const h = harness(200);
  h.state.nextBatchIndex = 1;
  h.state.sentRecipientCount = 100;
  h.advance(48 * 3600000);
  assert.equal((await h.run()).sentRecipientCount, 200);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].key, 'marketing-email-campaign-batch-1');
});

test('time budget yields and resumes without consuming failure attempts', async () => {
  const h = harness(1500);
  assert.equal((await h.run(18000)).status, 'PENDING');
  assert.equal(h.state.sentRecipientCount, 100);
  assert.equal((await h.run()).status, 'SENT');
  assert.equal(h.calls.length, 15);
});

test('quota rejection waits for UTC reset without recording an uncertain send', async () => {
  const h = harness(100);
  h.deps.send = async () => ({
    data: null,
    error: {
      name: 'daily_quota_exceeded',
      statusCode: 429,
      message: 'Quota reached',
    },
  });
  const result = await h.run();
  assert.equal(result.status, 'FAILED');
  assert.equal(result.nextAttemptAt.toISOString(), '2026-10-05T00:00:05.000Z');
  assert.equal(h.state.batchAttemptedAt, null);
});

test('429 after an ambiguous attempt must not clear the previous uncertainty', async () => {
  const h = harness(100);
  const firstAttempt = new Date(h.deps.now() - 120000);
  h.state.batchAttemptedAt = firstAttempt;
  h.deps.send = async () => ({
    data: null,
    error: {
      name: 'rate_limit_exceeded',
      statusCode: 429,
      message: 'Slow down',
    },
    headers: { 'Retry-After': '60' },
  });
  assert.equal((await h.run()).status, 'PENDING');
  assert.equal(h.state.batchAttemptedAt, firstAttempt);
});

test('network timeout retries and then yields with the original uncertainty timestamp', async () => {
  const h = harness(100);
  let calls = 0;
  const start = h.deps.now();
  h.deps.send = async () => {
    calls++;
    throw new Error('timeout');
  };
  assert.equal((await h.run()).status, 'PENDING');
  assert.equal(calls, 3);
  assert.equal(h.state.batchAttemptedAt.getTime(), start);
});

test('lease lost before send prevents an external side effect', async () => {
  const h = harness(100);
  h.deps.checkpoint = async () => {
    throw new Error('lease lost');
  };
  await assert.rejects(h.run(), /lease lost/);
  assert.equal(h.calls.length, 0);
});

test('retry delay understands dates, casing and invalid values', () => {
  const now = Date.parse('2026-10-04T10:00:00Z');
  assert.equal(
    retryDelayMs({ 'Retry-After': 'Sun, 04 Oct 2026 10:00:10 GMT' }, now, 0),
    10000,
  );
  assert.equal(retryDelayMs({ 'retry-after': 'invalid' }, now, 2), 4000);
});
