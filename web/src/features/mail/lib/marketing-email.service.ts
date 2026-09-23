import { executeServiceOrThrow } from '@/features/core';
import { requireStaffPermissionOrThrow } from '@/features/permission/lib/permission.service';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import { resend } from '@/lib/resend/resend';
import {
  claimMarketingEmailSendAttemptInPrismaRepository,
  createMarketingEmailInPrismaRepository,
  deleteMarketingEmailFromPrismaRepository,
  getMarketingEmailRecipientsFromPrismaRepository,
  getMarketingEmailsFromPrismaRepository,
  getMarketingEmailsToSendFromPrismaRepository,
  markMarketingEmailAsFailedInPrismaRepository,
  markMarketingEmailAsSentInPrismaRepository,
} from './marketing-email.repository';
import {
  createMarketingEmailSchema,
  deleteMarketingEmailSchema,
  getMarketingEmailsSchema,
} from './marketing-email.schema';
import { getMarketingEmailHtml } from './marketing-email.templates';
import type {
  TMarketingEmailRecipient,
  TMarketingEmailListItem,
  TMarketingEmailsPagination,
  TSendMarketingEmailsDetail,
  TSendMarketingEmailsOptions,
  TSendMarketingEmailsResult,
} from './marketing-email.types';

const MAX_MARKETING_EMAIL_ATTEMPTS = 3;
const MARKETING_EMAIL_SEND_LIMIT = 20;
const RESEND_BATCH_SIZE = 100;

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
): Promise<TMarketingEmailListItem> {
  const currentUser = await requireStaffPermissionOrThrow(
    'canManageMarketingEmails',
  );

  return await executeServiceOrThrow({
    serviceName: 'createMarketingEmailService',
    repositoryMethod: (parsedData) =>
      createMarketingEmailInPrismaRepository({
        ...parsedData,
        createdByUserId: currentUser.id,
        createdByEmail: currentUser.email,
      }),
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
  const marketingEmails = await getMarketingEmailsToSendFromPrismaRepository({
    limit: options.limit ?? MARKETING_EMAIL_SEND_LIMIT,
    maxAttempts: MAX_MARKETING_EMAIL_ATTEMPTS,
    scheduledForLte: options.ignoreSchedule
      ? undefined
      : (options.now ?? new Date()),
  });

  if (marketingEmails.length === 0) {
    return emptySendMarketingEmailsResult();
  }

  const recipients = await getMarketingEmailRecipientsFromPrismaRepository();
  const details: TSendMarketingEmailsDetail[] = [];

  for (const marketingEmail of marketingEmails) {
    const claimedMarketingEmail =
      await claimMarketingEmailSendAttemptInPrismaRepository({
        id: marketingEmail.id,
        maxAttempts: MAX_MARKETING_EMAIL_ATTEMPTS,
      });

    if (!claimedMarketingEmail) {
      details.push({
        id: marketingEmail.id,
        subject: marketingEmail.subject,
        status: 'SKIPPED',
        attempts: marketingEmail.emailAttempts,
        eligibleRecipientCount: marketingEmail.eligibleRecipientCount,
        sentRecipientCount: marketingEmail.sentRecipientCount,
        error: 'La campagne a déjà été traitée par un autre processus.',
      });
      continue;
    }

    let sentRecipientCount = 0;

    try {
      if (recipients.length === 0) {
        await markMarketingEmailAsSentInPrismaRepository({
          id: claimedMarketingEmail.id,
          eligibleRecipientCount: 0,
          sentRecipientCount: 0,
        });

        details.push({
          id: claimedMarketingEmail.id,
          subject: claimedMarketingEmail.subject,
          status: 'SENT',
          attempts: claimedMarketingEmail.emailAttempts,
          eligibleRecipientCount: 0,
          sentRecipientCount: 0,
          error: null,
        });
        continue;
      }

      sentRecipientCount = await sendMarketingEmailToRecipients({
        marketingEmail: claimedMarketingEmail,
        recipients,
      });

      await markMarketingEmailAsSentInPrismaRepository({
        id: claimedMarketingEmail.id,
        eligibleRecipientCount: recipients.length,
        sentRecipientCount,
      });

      details.push({
        id: claimedMarketingEmail.id,
        subject: claimedMarketingEmail.subject,
        status: 'SENT',
        attempts: claimedMarketingEmail.emailAttempts,
        eligibleRecipientCount: recipients.length,
        sentRecipientCount,
        error: null,
      });
    } catch (error) {
      const errorMessage = getSendMarketingEmailErrorMessage(error);

      await markMarketingEmailAsFailedInPrismaRepository({
        id: claimedMarketingEmail.id,
        errorMessage,
        eligibleRecipientCount: recipients.length,
        sentRecipientCount,
      });

      details.push({
        id: claimedMarketingEmail.id,
        subject: claimedMarketingEmail.subject,
        status: 'FAILED',
        attempts: claimedMarketingEmail.emailAttempts,
        eligibleRecipientCount: recipients.length,
        sentRecipientCount,
        error: errorMessage,
      });
    }
  }

  return toSendMarketingEmailsResult(details);
}

async function sendMarketingEmailToRecipients({
  marketingEmail,
  recipients,
}: {
  marketingEmail: {
    id: string;
    subject: string;
    eyebrow: string | null;
    title: string;
    intro: string | null;
    content: string;
    note: string | null;
  };
  recipients: TMarketingEmailRecipient[];
}): Promise<number> {
  const html = getMarketingEmailHtml({
    eyebrow: marketingEmail.eyebrow,
    title: marketingEmail.title,
    intro: marketingEmail.intro,
    content: marketingEmail.content,
    note: marketingEmail.note,
  });
  const from = getMarketingEmailFromAddress();
  let sentRecipientCount = 0;

  for (const [batchIndex, batchRecipients] of chunkArray(
    recipients,
    RESEND_BATCH_SIZE,
  ).entries()) {
    const result = await resend.batch.send(
      batchRecipients.map((recipient) => ({
        from,
        to: recipient.email,
        subject: marketingEmail.subject,
        html,
        tags: [
          {
            name: 'marketing_email_id',
            value: marketingEmail.id,
          },
        ],
      })),
      {
        batchValidation: 'strict',
        idempotencyKey: `marketing-email-${marketingEmail.id}-batch-${batchIndex}`,
      },
    );

    if (result.error || !result.data) {
      throw new Error(formatResendError(result.error));
    }

    sentRecipientCount += result.data.data.length;
  }

  return sentRecipientCount;
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

function emptySendMarketingEmailsResult(): TSendMarketingEmailsResult {
  return toSendMarketingEmailsResult([]);
}

function getSendMarketingEmailErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return "L'envoi de l'email marketing a échoué.";
}

function formatResendError(
  error: { message: string; name: string; statusCode: number | null } | null,
): string {
  if (!error) return "L'envoi Resend a échoué.";

  const status = error.statusCode ? ` (${error.statusCode})` : '';
  return `${error.name}${status}: ${error.message}`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
