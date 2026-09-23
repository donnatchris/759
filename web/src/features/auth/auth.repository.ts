import type { User } from '@prisma/client';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { prisma } from '@/lib/prisma/prisma';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import type {
  TBanUserByEmailOutput,
  TBanUsersByEmailOutput,
  TDeleteUserAccountOutput,
  TDeleteUserAccountsOutput,
  TUnbanEmailOutput,
  TUpdateUserCanBookStatusOutput,
  TUpdateUsersCanBookStatusOutput,
  TUpdateUsersRoleOutput,
  TUpdateUserProfileOutput,
} from './auth.schema';
import type {
  TAdminBannedEmailListItem,
  TAdminUserListItem,
} from './auth.types';

type TUpdateCurrentUserProfileRepositoryData = TUpdateUserProfileOutput & {
  userId: string;
};

type TUpdateUserCanBookStatusRepositoryData = TUpdateUserCanBookStatusOutput;
type TUpdateUsersCanBookStatusRepositoryData = TUpdateUsersCanBookStatusOutput;
type TUpdateUsersRoleRepositoryData = TUpdateUsersRoleOutput;

type TBanUserByEmailRepositoryData = TBanUserByEmailOutput;
type TBanUsersByEmailRepositoryData = TBanUsersByEmailOutput;
type TDeleteUserAccountRepositoryData = TDeleteUserAccountOutput & {
  allowStaffDeletion?: boolean;
};
type TDeleteUserAccountsRepositoryData = TDeleteUserAccountsOutput;
type TUnbanEmailRepositoryData = TUnbanEmailOutput;

export type TDeletedUserAccount = {
  id: string;
  name: string;
  email: string;
};

export type TDeleteUserAccountsResult = {
  deletedUsers: TDeletedUserAccount[];
  skippedUsersWithUpcomingReservations: TDeletedUserAccount[];
};

export async function updateCurrentUserProfileInPrismaRepository(
  data: TUpdateCurrentUserProfileRepositoryData,
): Promise<User> {
  try {
    return await prisma.$transaction(async (tx) => {
      const latestLegalTerms =
        data.legalTermsAccepted === true
          ? await tx.legalTerms.findFirst({
              orderBy: { createdAt: 'desc' },
              select: { id: true },
            })
          : null;

      if (data.legalTermsAccepted === true && !latestLegalTerms) {
        throw new AppError(ERROR_CODES.NOT_FOUND);
      }

      return await tx.user.update({
        where: { id: data.userId },
        data: {
          name: data.name,
          phone: data.phone,
          canReceiveMarketingEmails: data.canReceiveMarketingEmails,
          ...(latestLegalTerms
            ? {
                legalTermsAccepted: true,
                legalTermsAcceptedAt: new Date(),
                acceptedLegalTermsId: latestLegalTerms.id,
              }
            : {}),
        },
      });
    });
  } catch (error) {
    console.error(
      'Error in updateCurrentUserProfileInPrismaRepository:',
      error,
    );
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getAdminUsersFromPrismaRepository(): Promise<
  TAdminUserListItem[]
> {
  try {
    const now = new Date();
    const [users, pastCounts, upcomingCounts, cancelledCounts] =
      await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            createdAt: true,
            phone: true,
            role: true,
            canBook: true,
            canReceiveMarketingEmails: true,
          },
          orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
        }),
        prisma.reservation.groupBy({
          by: ['userId'],
          where: {
            userId: { not: null },
            startsAt: { lt: now },
            status: { not: 'CANCELLED' },
          },
          _count: {
            _all: true,
          },
        }),
        prisma.reservation.groupBy({
          by: ['userId'],
          where: {
            userId: { not: null },
            startsAt: { gte: now },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          _count: {
            _all: true,
          },
        }),
        prisma.reservation.groupBy({
          by: ['userId'],
          where: {
            userId: { not: null },
            status: 'CANCELLED',
          },
          _count: {
            _all: true,
          },
        }),
      ]);

    const pastCountByUserId = toCountByUserId(pastCounts);
    const upcomingCountByUserId = toCountByUserId(upcomingCounts);
    const cancelledCountByUserId = toCountByUserId(cancelledCounts);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      phone: user.phone,
      role: user.role,
      canBook: user.canBook,
      canReceiveMarketingEmails: user.canReceiveMarketingEmails,
      reservationCounts: {
        past: pastCountByUserId.get(user.id) ?? 0,
        upcoming: upcomingCountByUserId.get(user.id) ?? 0,
        cancelled: cancelledCountByUserId.get(user.id) ?? 0,
      },
    }));
  } catch (error) {
    console.error('Error in getAdminUsersFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateUserCanBookStatusInPrismaRepository(
  data: TUpdateUserCanBookStatusRepositoryData,
): Promise<User> {
  try {
    return await prisma.user.update({
      where: { id: data.userId },
      data: {
        canBook: data.canBook,
      },
    });
  } catch (error) {
    console.error('Error in updateUserCanBookStatusInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateUsersCanBookStatusInPrismaRepository(
  data: TUpdateUsersCanBookStatusRepositoryData,
): Promise<User[]> {
  try {
    return await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { id: { in: data.userIds } },
        select: { id: true },
      });

      assertAllUsersWereFound(data.userIds, users);

      await tx.user.updateMany({
        where: { id: { in: data.userIds } },
        data: {
          canBook: data.canBook,
        },
      });

      return await tx.user.findMany({
        where: { id: { in: data.userIds } },
      });
    });
  } catch (error) {
    console.error(
      'Error in updateUsersCanBookStatusInPrismaRepository:',
      error,
    );
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateUsersRoleInPrismaRepository(
  data: TUpdateUsersRoleRepositoryData,
): Promise<User[]> {
  try {
    return await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { id: { in: data.userIds } },
        select: { id: true, role: true },
      });

      assertAllUsersWereFound(data.userIds, users);
      if (users.some((user) => user.role === 'ADMIN')) {
        throw new AppError(ERROR_CODES.ADMIN_ROLE_PROTECTED);
      }

      const result = await tx.user.updateMany({
        where: {
          id: { in: data.userIds },
          role: { not: 'ADMIN' },
        },
        data: { role: data.role },
      });

      if (result.count !== data.userIds.length) {
        throw new AppError(ERROR_CODES.ADMIN_ROLE_PROTECTED);
      }

      if (data.role === 'USER') {
        await tx.staffPermission.deleteMany({
          where: { userId: { in: data.userIds } },
        });
      }

      return await tx.user.findMany({
        where: { id: { in: data.userIds } },
      });
    });
  } catch (error) {
    console.error('Error in updateUsersRoleInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getUserCanBookStatusFromPrismaRepository(
  userId: string,
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        canBook: true,
      },
    });

    if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);
    return user.canBook;
  } catch (error) {
    console.error('Error in getUserCanBookStatusFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function banUserByEmailInPrismaRepository(
  data: TBanUserByEmailRepositoryData,
): Promise<{ id: string; email: string }> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);
      if (user.role === 'ADMIN') {
        throw new AppError(ERROR_CODES.ADMIN_ACCOUNT_PROTECTED);
      }

      await assertUserHasNoUpcomingReservations(user.id, tx);

      const email = normalizeEmail(user.email);

      const bannedEmail = await tx.bannedEmail.upsert({
        where: { email },
        create: { email },
        update: {},
        select: {
          id: true,
          email: true,
        },
      });

      await tx.user.delete({
        where: { id: user.id },
      });

      return bannedEmail;
    });
  } catch (error) {
    console.error('Error in banUserByEmailInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function banUsersByEmailInPrismaRepository(
  data: TBanUsersByEmailRepositoryData,
): Promise<{ id: string; email: string }[]> {
  try {
    return await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { id: { in: data.userIds } },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      assertAllUsersWereFound(data.userIds, users);
      assertNoAdminUsers(users);
      await assertUsersHaveNoUpcomingReservations(data.userIds, tx);

      const bannedEmails = await Promise.all(
        users.map((user) =>
          tx.bannedEmail.upsert({
            where: { email: normalizeEmail(user.email) },
            create: { email: normalizeEmail(user.email) },
            update: {},
            select: {
              id: true,
              email: true,
            },
          }),
        ),
      );

      await tx.user.deleteMany({
        where: { id: { in: data.userIds } },
      });

      return bannedEmails;
    });
  } catch (error) {
    console.error('Error in banUsersByEmailInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteUserAccountInPrismaRepository(
  data: TDeleteUserAccountRepositoryData,
): Promise<TDeletedUserAccount> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);
      if (user.role === 'ADMIN') {
        throw new AppError(ERROR_CODES.ADMIN_ACCOUNT_PROTECTED);
      }
      if (user.role === 'STAFF' && !data.allowStaffDeletion) {
        throw new AppError(ERROR_CODES.STAFF_ACCOUNT_ADMIN_ONLY);
      }

      await assertUserHasNoUpcomingReservations(user.id, tx);

      return await tx.user.delete({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });
  } catch (error) {
    console.error('Error in deleteUserAccountInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteUserAccountsInPrismaRepository(
  data: TDeleteUserAccountsRepositoryData,
): Promise<TDeleteUserAccountsResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const users = await tx.user.findMany({
        where: { id: { in: data.userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      assertAllUsersWereFound(data.userIds, users);
      assertNoAdminUsers(users);

      const userIdsWithUpcomingReservations =
        await getUserIdsWithUpcomingReservations(data.userIds, tx);
      const deletedUsers = users
        .filter((user) => !userIdsWithUpcomingReservations.has(user.id))
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));
      const skippedUsersWithUpcomingReservations = users
        .filter((user) => userIdsWithUpcomingReservations.has(user.id))
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }));

      if (deletedUsers.length > 0) {
        await tx.user.deleteMany({
          where: { id: { in: deletedUsers.map((user) => user.id) } },
        });
      }

      return {
        deletedUsers,
        skippedUsersWithUpcomingReservations,
      };
    });
  } catch (error) {
    console.error('Error in deleteUserAccountsInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getAdminBannedEmailsFromPrismaRepository(): Promise<
  TAdminBannedEmailListItem[]
> {
  try {
    const bannedEmails = await prisma.bannedEmail.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bannedEmails.map((bannedEmail) => ({
      id: bannedEmail.id,
      email: bannedEmail.email,
      createdAt: bannedEmail.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error in getAdminBannedEmailsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function unbanEmailInPrismaRepository(
  data: TUnbanEmailRepositoryData,
): Promise<{ id: string; email: string }> {
  try {
    const bannedEmail = await prisma.bannedEmail.delete({
      where: {
        id: data.bannedEmailId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return bannedEmail;
  } catch (error) {
    console.error('Error in unbanEmailInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

function toCountByUserId(
  counts: Array<{ userId: string | null; _count: { _all: number } }>,
): Map<string, number> {
  return new Map(
    counts
      .filter((count): count is { userId: string; _count: { _all: number } } =>
        Boolean(count.userId),
      )
      .map((count) => [count.userId, count._count._all]),
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertAllUsersWereFound(
  userIds: string[],
  users: Array<{ id: string }>,
) {
  if (users.length !== userIds.length) {
    throw new AppError(ERROR_CODES.NOT_FOUND);
  }
}

function assertNoAdminUsers(users: Array<{ role: string }>) {
  if (users.some((user) => user.role === 'ADMIN')) {
    throw new AppError(ERROR_CODES.ADMIN_ACCOUNT_PROTECTED);
  }
}

async function assertUserHasNoUpcomingReservations(
  userId: string,
  client: Pick<typeof prisma, 'reservation'>,
) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingReservationCount = await client.reservation.count({
    where: {
      userId,
      startsAt: {
        gte: startOfToday,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
  });

  if (upcomingReservationCount > 0) {
    throw new AppError(ERROR_CODES.USER_HAS_UPCOMING_RESERVATIONS);
  }
}

async function assertUsersHaveNoUpcomingReservations(
  userIds: string[],
  client: Pick<typeof prisma, 'reservation'>,
) {
  const upcomingUserIds = await getUserIdsWithUpcomingReservations(
    userIds,
    client,
  );

  if (upcomingUserIds.size > 0) {
    throw new AppError(ERROR_CODES.USER_HAS_UPCOMING_RESERVATIONS);
  }
}

async function getUserIdsWithUpcomingReservations(
  userIds: string[],
  client: Pick<typeof prisma, 'reservation'>,
): Promise<Set<string>> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingReservationCounts = await client.reservation.groupBy({
    by: ['userId'],
    where: {
      userId: {
        in: userIds,
      },
      startsAt: {
        gte: startOfToday,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    _count: {
      _all: true,
    },
  });

  return new Set(
    upcomingReservationCounts
      .filter((count): count is { userId: string; _count: { _all: number } } =>
        Boolean(count.userId),
      )
      .map((count) => count.userId),
  );
}
