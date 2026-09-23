'use server';

import fs from 'fs/promises';
import path from 'path';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES, isAppError } from '@/features/core/error/error.handling';
import sharp from 'sharp';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import {
  getImageUrl,
  IMAGE_DIRECTORY,
  isImageFile,
  resolveImagePath,
} from './image.storage';
import {
  MAX_IMAGE_FILE_SIZE_BYTES,
  MAX_IMAGES_COUNT,
} from './image.const';

export type TPublicImage = {
  name: string;
  url: string;
};

const OUTPUT_IMAGE_EXTENSION = '.webp';

function sanitizeImageName(imageName: string): string {
  return path.basename(imageName).replaceAll(' ', '-');
}

async function compressImage(imageData: Buffer): Promise<Buffer> {
  return sharp(imageData)
    .rotate()
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
    })
    .toBuffer();
}

export async function getPublicImagesService(): Promise<TPublicImage[]> {
  try {
    await fs.mkdir(IMAGE_DIRECTORY, { recursive: true });
    const imageFiles = await fs.readdir(IMAGE_DIRECTORY);
    return imageFiles.filter(isImageFile).map((file) => ({
      name: file,
      url: getImageUrl(file),
    }));
  } catch (error) {
    console.error('Error reading public images:', error);
    if (isAppError(error)) throw error;
    throw new AppError(ERROR_CODES.FILE_SYSTEM_ERROR);
  }
}

export async function uploadPublicImageService(
  imageName: string,
  imageData: Buffer,
): Promise<void> {
  try {
    await requireAdminOrThrow();
    const existingImages = await getPublicImagesService();

    if (existingImages.length >= MAX_IMAGES_COUNT) {
      throw new AppError(ERROR_CODES.MAX_FILES_ERROR);
    }

    if (imageData.byteLength > MAX_IMAGE_FILE_SIZE_BYTES) {
      throw new AppError(ERROR_CODES.MAX_FILE_SIZE_ERROR);
    }

    const sanitizedImageName = sanitizeImageName(imageName);

    if (!isImageFile(sanitizedImageName)) {
      throw new AppError(ERROR_CODES.INVALID_FILE_TYPE);
    }

    const existingImageNames = existingImages.map((img) => img.name);

    const parsed = path.parse(sanitizedImageName);
    const nameWithoutExt = parsed.name;

    let safeImageName = `${nameWithoutExt}${OUTPUT_IMAGE_EXTENSION}`;
    let suffix = 1;

    while (existingImageNames.includes(safeImageName)) {
      safeImageName = `${nameWithoutExt}(${suffix})${OUTPUT_IMAGE_EXTENSION}`;
      suffix++;
    }

    const imagePath = resolveImagePath(safeImageName);

    if (!imagePath) {
      throw new AppError(ERROR_CODES.FILE_SYSTEM_ERROR);
    }

    const compressedImageData = await compressImage(imageData);

    await fs.writeFile(imagePath, compressedImageData);
  } catch (error) {
    console.error('Error uploading image:', error);
    if (isAppError(error)) throw error;
    throw new AppError(ERROR_CODES.FILE_SYSTEM_ERROR);
  }
}

export async function deletePublicImageService(
  imageName: string,
): Promise<void> {
  try {
    await requireAdminOrThrow();

    if (!isImageFile(imageName)) {
      throw new AppError(ERROR_CODES.INVALID_FILE_TYPE);
    }

    const existingImages = await getPublicImagesService();
    const existingImageNames = existingImages.map((img) => img.name);

    if (!existingImageNames.includes(imageName)) {
      throw new AppError(ERROR_CODES.NOT_FOUND);
    }

    const imagePath = resolveImagePath(imageName);

    if (!imagePath) {
      throw new AppError(ERROR_CODES.FILE_SYSTEM_ERROR);
    }

    await fs.unlink(imagePath);
  } catch (error) {
    console.error('Error deleting image:', error);
    if (isAppError(error)) throw error;
    throw new AppError(ERROR_CODES.FILE_SYSTEM_ERROR);
  }
}
