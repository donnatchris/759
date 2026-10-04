import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { prisma } from '@/lib/prisma/prisma';
import type { MarketingEmail, Prisma } from '@prisma/client';
import type {
  TCreateMarketingEmailOutput,
  TDeleteMarketingEmailOutput,
  TGetMarketingEmailsOutput,
} from './marketing-email.schema';
import type {
  TMarketingEmailListItem,
  TMarketingEmailRecipient,
  TMarketingEmailsPagination,
} from './marketing-email.types';

type TCreateMarketingEmailRepositoryData = TCreateMarketingEmailOutput & {
  createdByUserId: string;
  createdByEmail: string;
};

export async function getMarketingEmailsFromPrismaRepository(
  data: TGetMarketingEmailsOutput,
): Promise<TMarketingEmailsPagination> {
  try {
    const skip = (data.page - 1) * data.pageSize;

    const [items, totalCount] = await Promise.all([
      prisma.marketingEmail.findMany({
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: data.pageSize,
      }),
      prisma.marketingEmail.count(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / data.pageSize));

    return {
      items: items.map(toMarketingEmailListItem),
      page: data.page,
      pageSize: data.pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: data.page > 1,
      hasNextPage: data.page < totalPages,
      previousPage: data.page > 1 ? data.page - 1 : null,
      nextPage: data.page < totalPages ? data.page + 1 : null,
    };
  } catch (error) {
    console.error('Error in getMarketingEmailsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createMarketingEmailInPrismaRepository(
  data: TCreateMarketingEmailRepositoryData,
  transaction?: Prisma.TransactionClient,
): Promise<TMarketingEmailListItem> {
  try {
    const create = async (tx: Prisma.TransactionClient) => {
      const eligibleRecipientCount = await tx.user.count({
        where: { emailVerified: true, canReceiveMarketingEmails: true },
      });
      const marketingEmail = await tx.marketingEmail.create({
        data: {
          subject: data.subject,
          eyebrow: data.eyebrow ?? null,
          title: data.title,
          intro: data.intro ?? null,
          content: data.content,
          note: data.note ?? null,
          imageUrl: data.imageUrl ?? null,
          links: data.links,
          scheduledFor: getNextNightSendDate(),
          createdByUserId: data.createdByUserId,
          createdByEmail: data.createdByEmail,
          eligibleRecipientCount,
        },
      });
      return toMarketingEmailListItem(marketingEmail);
    };
    return transaction
      ? await create(transaction)
      : await prisma.$transaction(create);
  } catch (error) {
    console.error('Error in createMarketingEmailInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteMarketingEmailFromPrismaRepository(
  data: TDeleteMarketingEmailOutput,
): Promise<void> {
  try {
    await prisma.marketingEmail.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteMarketingEmailFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getMarketingEmailRecipientsFromPrismaRepository(): Promise<
  TMarketingEmailRecipient[]
> {
  try {
    return await prisma.user.findMany({
      where: {
        emailVerified: true,
        canReceiveMarketingEmails: true,
      },
      select: {
        email: true,
      },
      orderBy: {
        email: 'asc',
      },
    });
  } catch (error) {
    console.error(
      'Error in getMarketingEmailRecipientsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

function getNextNightSendDate() {
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 1);
  scheduledFor.setHours(2, 0, 0, 0);
  return scheduledFor;
}

function toMarketingEmailListItem(
  marketingEmail: MarketingEmail,
): TMarketingEmailListItem {
  return {
    id: marketingEmail.id,
    subject: marketingEmail.subject,
    eyebrow: marketingEmail.eyebrow,
    title: marketingEmail.title,
    intro: marketingEmail.intro,
    content: marketingEmail.content,
    note: marketingEmail.note,
    imageUrl: marketingEmail.imageUrl,
    links: marketingEmail.links,
    status: marketingEmail.status,
    scheduledFor: marketingEmail.scheduledFor.toISOString(),
    sentAt: marketingEmail.sentAt?.toISOString() ?? null,
    eligibleRecipientCount: marketingEmail.eligibleRecipientCount,
    sentRecipientCount: marketingEmail.sentRecipientCount,
    emailAttempts: marketingEmail.emailAttempts,
    emailLastAttemptAt:
      marketingEmail.emailLastAttemptAt?.toISOString() ?? null,
    emailLastError: marketingEmail.emailLastError,
    createdByUserId: marketingEmail.createdByUserId,
    createdByEmail: marketingEmail.createdByEmail,
    createdAt: marketingEmail.createdAt.toISOString(),
    updatedAt: marketingEmail.updatedAt.toISOString(),
  };
}
