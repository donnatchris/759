import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';

const LEASE_MS = 120_000;

export class MarketingEmailLeaseLostError extends Error {
  constructor() {
    super(
      'Le traitement de cette campagne a été repris par un autre processus.',
    );
  }
}

function eligible(now: Date): Prisma.MarketingEmailWhereInput {
  return {
    sentAt: null,
    requiresReview: false,
    consecutiveFailures: { lt: 3 },
    AND: [
      { OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }] },
      {
        OR: [
          { status: { in: ['PENDING', 'FAILED'] } },
          { status: 'SENDING', sendLeaseExpiresAt: { lte: now } },
        ],
      },
    ],
  };
}

export async function getMarketingEmailsToSendFromPrismaRepository({
  limit,
  scheduledForLte,
}: {
  limit: number;
  scheduledForLte?: Date;
}) {
  return prisma.marketingEmail.findMany({
    where: {
      ...eligible(new Date()),
      ...(scheduledForLte ? { scheduledFor: { lte: scheduledForLte } } : {}),
    },
    orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'asc' }],
    take: limit,
  });
}

export async function claimMarketingEmailSendAttemptInPrismaRepository(
  id: string,
) {
  const now = new Date();
  const sendLeaseToken = randomUUID();
  const result = await prisma.marketingEmail.updateMany({
    where: { id, ...eligible(now) },
    data: {
      status: 'SENDING',
      sendLeaseToken,
      sendLeaseExpiresAt: new Date(now.getTime() + LEASE_MS),
      emailAttempts: { increment: 1 },
      emailLastAttemptAt: now,
      emailLastError: null,
      nextAttemptAt: null,
    },
  });
  if (!result.count) return null;
  return prisma.marketingEmail.findFirst({ where: { id, sendLeaseToken } });
}

// All checkpoints are fenced: an expired worker cannot overwrite its successor.
export async function checkpointMarketingEmail(
  id: string,
  sendLeaseToken: string,
  data: Prisma.MarketingEmailUpdateManyMutationInput,
) {
  const now = new Date();
  const result = await prisma.marketingEmail.updateMany({
    where: {
      id,
      status: 'SENDING',
      sendLeaseToken,
      sendLeaseExpiresAt: { gt: now },
    },
    data: { sendLeaseExpiresAt: new Date(now.getTime() + LEASE_MS), ...data },
  });
  if (!result.count) throw new MarketingEmailLeaseLostError();
}

// One slot/second for marketing across workers, not just one in-memory limiter.
export async function reserveMarketingEmailSlot(): Promise<Date> {
  const [slot] = await prisma.$queryRaw<{ slot: Date }[]>`
    INSERT INTO "marketing_email_dispatch_clock" ("id", "nextSlotAt")
    VALUES ('resend', (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '1 second')
    ON CONFLICT ("id") DO UPDATE
    SET "nextSlotAt" = GREATEST("marketing_email_dispatch_clock"."nextSlotAt",
        CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '1 second'
    RETURNING "nextSlotAt" - INTERVAL '1 second' AS slot
  `;
  return slot.slot;
}
