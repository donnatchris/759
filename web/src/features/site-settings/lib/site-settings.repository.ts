import { prisma } from '@/lib/prisma/prisma';
import { SiteSettings } from '@prisma/client';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';

export async function getSiteSettingsFromPrismaRepository(): Promise<SiteSettings> {
  try {
    const res = await prisma.siteSettings.findFirst();
    if (!res) throw new AppError(ERROR_CODES.NOT_FOUND);
    return res;
  } catch (error) {
    console.error('Error in getSiteSettingsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

type TSiteSettingsUpdate = {
  fullName: string;
  shortName: string;
  sloganHead: string | null | undefined;
  sloganAccent: string | null | undefined;
  sloganTail: string | null | undefined;
  address: string | null | undefined;
  tel: string | null | undefined;
  mail: string | null | undefined;
  seoTitle: string | null | undefined;
  activities: string[];
};

export function updateSiteSettingsInPrismaRepository(
  data: TSiteSettingsUpdate,
): Promise<SiteSettings> {
  try {
    const res = prisma.siteSettings.update({
      where: {
        id: 1,
      },
      data: {
        fullName: data.fullName,
        shortName: data.shortName,
        sloganHead: data.sloganHead ?? null,
        sloganAccent: data.sloganAccent ?? null,
        sloganTail: data.sloganTail ?? null,
        address: data.address ?? null,
        tel: data.tel ?? null,
        mail: data.mail ?? null,
        seoTitle: data.seoTitle ?? null,
        activities: data.activities,
      },
    });
    return res;
  } catch (error) {
    console.error('Error in updateSiteSettingsInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
