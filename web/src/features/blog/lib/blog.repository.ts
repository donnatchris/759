import type { Prisma } from '@prisma/client';
import { requireBlogEnabled } from '@/settings/settings.guards';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { prisma } from '@/lib/prisma/prisma';
import type {
  TCreateBlogPostOutput,
  TDeleteBlogPostOutput,
  TGetBlogPostsOutput,
  TUpdateBlogPostOutput,
} from './blog.schema';
import type { BlogPost, TBlogPostsPagination } from './blog.types';

export async function getLatestBlogPostFromPrismaRepository(): Promise<BlogPost | null> {
  requireBlogEnabled();
  try {
    return await prisma.blogPost.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error in getLatestBlogPostFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getBlogPostsFromPrismaRepository(
  data: TGetBlogPostsOutput,
): Promise<TBlogPostsPagination> {
  requireBlogEnabled();
  try {
    const skip = (data.page - 1) * data.pageSize;
    const take = data.pageSize;

    const [items, aggregate] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.blogPost.aggregate({
        _count: { id: true },
        _max: { updatedAt: true },
      }),
    ]);

    const count = aggregate._count.id;
    const hasMore = skip + items.length < count;

    return {
      items,
      hasMore,
      nextPage: hasMore ? data.page + 1 : null,
      version: `${count}:${aggregate._max.updatedAt?.getTime() ?? 0}`,
    };
  } catch (error) {
    console.error('Error in getBlogPostsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createBlogPostInPrismaRepository(
  data: TCreateBlogPostOutput,
  transaction: Prisma.TransactionClient = prisma,
): Promise<BlogPost> {
  requireBlogEnabled();
  try {
    if (!data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await transaction.blogPost.create({
      data: {
        title: data.title,
        subTitle: data.subTitle ?? null,
        tag: data.tag ?? null,
        content: data.content,
        author: data.author ?? null,
        imageUrl: data.imageUrl ?? null,
        links: data.links,
        eventStartDate: data.eventStartDate ?? null,
        eventEndDate: data.eventEndDate ?? null,
      },
    });
  } catch (error) {
    console.error('Error in createBlogPostInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function editBlogPostFromPrismaRepository(
  data: TUpdateBlogPostOutput,
): Promise<BlogPost> {
  requireBlogEnabled();
  try {
    if (!data.id || !data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.blogPost.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subTitle: data.subTitle ?? null,
        tag: data.tag ?? null,
        content: data.content,
        author: data.author ?? null,
        imageUrl: data.imageUrl ?? null,
        links: data.links,
        eventStartDate: data.eventStartDate ?? null,
        eventEndDate: data.eventEndDate ?? null,
      },
    });
  } catch (error) {
    console.error('Error in editBlogPostFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteBlogPostFromPrismaRepository(
  data: TDeleteBlogPostOutput,
): Promise<void> {
  requireBlogEnabled();
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    await prisma.blogPost.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteBlogPostFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
