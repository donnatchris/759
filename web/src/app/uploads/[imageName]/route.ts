import fs from 'fs/promises';
import {
  getImageContentType,
  resolveImagePath,
} from '@/features/core/image/lib/image.storage';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imageName: string }> },
) {
  const { imageName } = await params;
  const imagePath = resolveImagePath(imageName);

  if (!imagePath) {
    return new Response(null, { status: 404 });
  }

  try {
    const image = await fs.readFile(imagePath);

    return new Response(image, {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Content-Type': getImageContentType(imageName),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return new Response(null, { status: 404 });
    }

    console.error('Error reading uploaded image:', error);
    return new Response(null, { status: 500 });
  }
}
