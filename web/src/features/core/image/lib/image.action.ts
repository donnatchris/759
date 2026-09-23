'use server';

import {
  ServerResponse,
  TServerResponse,
} from '@/features/core/server/server.response';
import { AppError } from '../../error/error.AppError';
import { ERROR_CODES } from '../../error/error.handling';
import {
  getPublicImagesService,
  uploadPublicImageService,
  deletePublicImageService,
} from './image.service';
import type { TPublicImage } from './image.service';
import {
  MAX_IMAGE_FILE_SIZE_BYTES,
  MAX_IMAGES_COUNT,
} from './image.const';

export async function getPublicImages(): Promise<
  TServerResponse<TPublicImage[]>
> {
  try {
    const res = await getPublicImagesService();
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in getPublicImagesAction:', error);
    return ServerResponse.failure(error);
  }
}

export async function deletePublicImage(
  imageName: string,
): Promise<TServerResponse<void>> {
  try {
    const res = await deletePublicImageService(imageName);
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in deletePublicImageAction:', error);
    return ServerResponse.failure(error);
  }
}

export async function uploadImage(
  formData: FormData,
): Promise<TServerResponse<void>> {
  try {
    const existingImages = await getPublicImagesService();
    if (existingImages.length >= MAX_IMAGES_COUNT) {
      throw new AppError(ERROR_CODES.MAX_FILES_ERROR);
    }
    const file = formData.get('image');

    if (!(file instanceof File))
      throw new AppError(ERROR_CODES.INVALID_FILE_TYPE);

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      throw new AppError(ERROR_CODES.MAX_FILE_SIZE_ERROR);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const res = await uploadPublicImageService(file.name, buffer);
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in uploadImageAction:', error);
    return ServerResponse.failure(error);
  }
}
