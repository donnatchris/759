import type { Prisma } from '@prisma/client';
import { executeServiceOrThrow } from '@/features/core';
import { requireStaffPermissionOrThrow } from '@/features/permission/lib/permission.service';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import { resend } from '@/lib/resend/resend';
import {
  createMarketingEmailInPrismaRepository,
  deleteMarketingEmailFromPrismaRepository,
  getMarketingEmailRecipientsFromPrismaRepository,
  getMarketingEmailsFromPrismaRepository,
} from './marketing-email.repository';
import {
  createMarketingEmailSchema,
  deleteMarketingEmailSchema,
  getMarketingEmailsSchema,
} from './marketing-email.schema';
import { getAppHomeUrl } from './email-layout';
import { getMarketingEmailHtml } from './marketing-email.templates';
import type {
  TMarketingEmailListItem,
  TMarketingEmailsPagination,
  TSendMarketingEmailsDetail,
  TSendMarketingEmailsOptions,
  TSendMarketingEmailsResult,
} from './marketing-email.types';

import {
  checkpointMarketingEmail,
  claimMarketingEmailSendAttemptInPrismaRepository,
  getMarketingEmailsToSendFromPrismaRepository,
  MarketingEmailLeaseLostError,
  reserveMarketingEmailSlot,
} from './marketing-email.delivery-repository';
import {
  deliverMarketingEmail,
  type MarketingSnapshot,
} from './marketing-email.delivery';

const MARKETING_EMAIL_SEND_LIMIT = 20;
const RUN_BUDGET_MS = 40_000;

export async function getMarketingEmailsService(
  data: unknown,
): Promise<TMarketingEmailsPagination> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getMarketingEmailsService',
    repositoryMethod: getMarketingEmailsFromPrismaRepository,
    data,
    zodSchema: getMarketingEmailsSchema,
  });
}

export async function createMarketingEmailService(
  data: unknown,
  transaction?: Prisma.TransactionClient,
): Promise<TMarketingEmailListItem> {
  const currentUser = await requireStaffPermissionOrThrow(
    'canManageMarketingEmails',
  );

  return await executeServiceOrThrow({
    serviceName: 'createMarketingEmailService',
    repositoryMethod: (parsedData) =>
      createMarketingEmailInPrismaRepository(
        {
          ...parsedData,
          imageUrl: parsedData.imageUrl
            ? new URL(parsedData.imageUrl, getAppHomeUrl()).toString()
            : null,
          createdByUserId: currentUser.id,
          createdByEmail: currentUser.email,
        },
        transaction,
      ),
    data,
    zodSchema: createMarketingEmailSchema,
  });
}

export async function deleteMarketingEmailService(
  data: unknown,
): Promise<void> {
  await requireStaffPermissionOrThrow('canManageMarketingEmails');

  return await executeServiceOrThrow({
    serviceName: 'deleteMarketingEmailService',
    repositoryMethod: deleteMarketingEmailFromPrismaRepository,
    data,
    zodSchema: deleteMarketingEmailSchema,
  });
}

export async function sendMarketingEmails(
  options: TSendMarketingEmailsOptions = {},
): Promise<TSendMarketingEmailsResult> {
  const deadline = Date.now() + RUN_BUDGET_MS;
  const marketingEmails = await getMarketingEmailsToSendFromPrismaRepository({
    limit: options.limit ?? MARKETING_EMAIL_SEND_LIMIT,
    scheduledForLte: options.ignoreSchedule
      ? undefined
      : (options.now ?? new Date()),
  });
  const details: TSendMarketingEmailsDetail[] = [];

  for (const marketingEmail of marketingEmails) {
    if (Date.now() + 17_000 >= deadline) break;
    const claimed = await claimMarketingEmailSendAttemptInPrismaRepository(
      marketingEmail.id,
    );
    if (!claimed?.sendLeaseToken) continue;
    const checkpoint = (data: Prisma.MarketingEmailUpdateManyMutationInput) =>
      checkpointMarketingEmail(claimed.id, claimed.sendLeaseToken!, data);
    let sentRecipientCount = claimed.sentRecipientCount;
    let eligibleRecipientCount = claimed.eligibleRecipientCount;
    try {
      // Freeze recipients, sender and rendered content once. Retries must have
      // exactly the same payload, even if users or templates change meanwhile.
      let snapshot = claimed.deliverySnapshot as MarketingSnapshot | null;
      if (!snapshot) {
        const recipients =
          await getMarketingEmailRecipientsFromPrismaRepository();
        snapshot = {
          from: getMarketingEmailFromAddress(),
          subject: claimed.subject,
          html: getMarketingEmailHtml(claimed),
          recipients: recipients.map((recipient) => recipient.email),
        };
        eligibleRecipientCount = snapshot.recipients.length;
        await checkpoint({
          deliverySnapshot: snapshot,
          eligibleRecipientCount,
        });
      }
      const outcome = await deliverMarketingEmail(
        {
          id: claimed.id,
          snapshot,
          nextBatchIndex: claimed.nextBatchIndex,
          batchAttemptedAt: claimed.batchAttemptedAt,
          sentRecipientCount,
        },
        deadline,
        {
          now: Date.now,
          sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
          reserveSlot: reserveMarketingEmailSlot,
          checkpoint: async (data) => {
            await checkpoint(data);
            // Update local count only after the durable checkpoint succeeds.
            if (data.sentRecipientCount !== undefined)
              sentRecipientCount = data.sentRecipientCount;
          },
          send: (messages, idempotencyKey, timeoutMs) =>
            resend.batch.send(messages, {
              batchValidation: 'strict',
              idempotencyKey,
              signal: AbortSignal.timeout(timeoutMs),
            }),
        },
      );
      await checkpoint({
        status: outcome.status,
        sentRecipientCount: outcome.sentRecipientCount,
        sentAt: outcome.status === 'SENT' ? new Date() : null,
        emailLastError: outcome.error?.slice(0, 1000) ?? null,
        nextAttemptAt: outcome.nextAttemptAt ?? null,
        requiresReview: outcome.requiresReview ?? false,
        ...(outcome.status === 'FAILED'
          ? { consecutiveFailures: { increment: 1 } }
          : {}),
        sendLeaseToken: null,
        sendLeaseExpiresAt: null,
      });
      details.push({
        id: claimed.id,
        subject: claimed.subject,
        status: outcome.status === 'PENDING' ? 'DEFERRED' : outcome.status,
        attempts: claimed.emailAttempts,
        eligibleRecipientCount,
        sentRecipientCount: outcome.sentRecipientCount,
        error: outcome.error,
      });
    } catch (error) {
      // Leave the durable checkpoint untouched on database errors. The expired
      // lease lets a later cron recover, including an unacknowledged batch.
      if (!(error instanceof MarketingEmailLeaseLostError)) throw error;
      details.push({
        id: claimed.id,
        subject: claimed.subject,
        status: 'SKIPPED',
        attempts: claimed.emailAttempts,
        eligibleRecipientCount,
        sentRecipientCount,
        error: error.message,
      });
    }
  }
  return toSendMarketingEmailsResult(details);
}

function getMarketingEmailFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is missing');
  }

  return from;
}

function toSendMarketingEmailsResult(
  details: TSendMarketingEmailsDetail[],
): TSendMarketingEmailsResult {
  return {
    processedMarketingEmailCount: details.length,
    sentMarketingEmailCount: details.filter(
      (detail) => detail.status === 'SENT',
    ).length,
    failedMarketingEmailCount: details.filter(
      (detail) => detail.status === 'FAILED',
    ).length,
    deferredMarketingEmailCount: details.filter(
      (detail) => detail.status === 'DEFERRED',
    ).length,
    skippedMarketingEmailCount: details.filter(
      (detail) => detail.status === 'SKIPPED',
    ).length,
    sentRecipientCount: details.reduce(
      (total, detail) => total + detail.sentRecipientCount,
      0,
    ),
    details,
  };
}
