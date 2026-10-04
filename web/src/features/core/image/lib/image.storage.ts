import path from 'path';

export const IMAGE_DIRECTORY = path.join(process.cwd(), 'uploads');
export const IMAGE_URL_PREFIX = '/uploads';

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
] as const;

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function isImageFile(fileName: string): boolean {
  return ALLOWED_IMAGE_EXTENSIONS.includes(
    path
      .extname(fileName)
      .toLowerCase() as (typeof ALLOWED_IMAGE_EXTENSIONS)[number],
  );
}

export function getImageUrl(fileName: string): string {
  return `${IMAGE_URL_PREFIX}/${encodeURIComponent(fileName)}`;
}

export function resolveImagePath(fileName: string): string | null {
  if (path.basename(fileName) !== fileName || !isImageFile(fileName)) {
    return null;
  }

  const imagePath = path.resolve(IMAGE_DIRECTORY, fileName);

  if (!imagePath.startsWith(IMAGE_DIRECTORY + path.sep)) {
    return null;
  }

  return imagePath;
}

export function getImageContentType(fileName: string): string {
  return (
    IMAGE_CONTENT_TYPES[path.extname(fileName).toLowerCase()] ??
    'application/octet-stream'
  );
}
