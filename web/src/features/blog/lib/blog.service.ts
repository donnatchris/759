import { requireBlogEnabled } from '@/settings/settings.guards';
import { executeServiceOrThrow } from '@/features/core';
import {
  createBlogPostInPrismaRepository,
  deleteBlogPostFromPrismaRepository,
  editBlogPostFromPrismaRepository,
  getBlogPostsFromPrismaRepository,
  getLatestBlogPostFromPrismaRepository,
} from './blog.repository';
import {
  createBlogPostSchema,
  deleteBlogPostSchema,
  getBlogPostsSchema,
  updateBlogPostSchema,
} from './blog.schema';
import type { BlogPost, TBlogPostsPagination } from './blog.types';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';

export async function getLatestBlogPostService(): Promise<BlogPost | null> {
  requireBlogEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getLatestBlogPostService',
    repositoryMethod: getLatestBlogPostFromPrismaRepository,
  });
}

export async function getBlogPostsService(
  data: unknown,
): Promise<TBlogPostsPagination> {
  requireBlogEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getBlogPostsService',
    repositoryMethod: getBlogPostsFromPrismaRepository,
    data,
    zodSchema: getBlogPostsSchema,
  });
}

export async function createBlogPostService(data: unknown): Promise<BlogPost> {
  requireBlogEnabled();
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'createBlogPostService',
    repositoryMethod: createBlogPostInPrismaRepository,
    data,
    zodSchema: createBlogPostSchema,
  });
}

export async function editBlogPostService(data: unknown): Promise<BlogPost> {
  requireBlogEnabled();
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'editBlogPostService',
    repositoryMethod: editBlogPostFromPrismaRepository,
    data,
    zodSchema: updateBlogPostSchema,
  });
}

export async function deleteBlogPostService(data: unknown): Promise<void> {
  requireBlogEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteBlogPostService',
    repositoryMethod: deleteBlogPostFromPrismaRepository,
    data,
    zodSchema: deleteBlogPostSchema,
  });
}
