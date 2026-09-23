import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { prisma } from '@/lib/prisma/prisma';
import type { TCreateLegalTermsOutput } from './legal-terms.schema';
import type { LegalTerms } from './legal-terms.types';

export async function getLatestLegalTermsFromPrismaRepository(): Promise<LegalTerms | null> {
  try {
    return await prisma.legalTerms.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error in getLatestLegalTermsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function hasUserAcceptedLatestLegalTermsFromPrismaRepository(
  userId: string,
): Promise<boolean> {
  try {
    const [latestLegalTerms, user] = await prisma.$transaction([
      prisma.legalTerms.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          legalTermsAccepted: true,
          acceptedLegalTermsId: true,
        },
      }),
    ]);

    if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (!latestLegalTerms) return false;

    return (
      user.legalTermsAccepted === true &&
      user.acceptedLegalTermsId === latestLegalTerms.id
    );
  } catch (error) {
    console.error(
      'Error in hasUserAcceptedLatestLegalTermsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createLegalTermsInPrismaRepository(
  data: TCreateLegalTermsOutput,
): Promise<LegalTerms> {
  try {
    return await prisma.legalTerms.create({
      data: {
        content: data.content,
      },
    });
  } catch (error) {
    console.error('Error in createLegalTermsInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
