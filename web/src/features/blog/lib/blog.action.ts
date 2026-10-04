'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import { revalidatePath } from 'next/cache';
import {
  createBlogPostService,
  deleteBlogPostService,
  editBlogPostService,
  getBlogPostsService,
  getLatestBlogPostService,
} from './blog.service';
import type { BlogPost, TBlogPostsPagination } from './blog.types';

export async function getLatestBlogPostAction(): Promise<
  TServerResponse<BlogPost | null>
> {
  return await executeAction({
    actionName: 'getLatestBlogPostAction',
    service: getLatestBlogPostService,
  });
}

export async function getBlogPostsAction(
  data: unknown,
): Promise<TServerResponse<TBlogPostsPagination>> {
  return await executeAction({
    actionName: 'getBlogPostsAction',
    service: getBlogPostsService,
    input: data,
  });
}

export async function createBlogPostAction(
  data: unknown,
): Promise<TServerResponse<BlogPost>> {
  const response = await executeAction({
    actionName: 'createBlogPostAction',
    service: createBlogPostService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return response;
}

export async function editBlogPostAction(
  data: unknown,
): Promise<TServerResponse<BlogPost>> {
  const response = await executeAction({
    actionName: 'editBlogPostAction',
    service: editBlogPostService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return response;
}

export async function deleteBlogPostAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const response = await executeAction({
    actionName: 'deleteBlogPostAction',
    service: deleteBlogPostService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/blog');
    revalidatePath('/');
  }

  return response;
}
