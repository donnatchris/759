import { readdir } from 'node:fs/promises';
import { dirname, extname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SUPPORTED_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.heic',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff',
]);

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = join(scriptDirectory, '../../..', 'uploads');

async function convertImages() {
  const entries = await readdir(uploadsDirectory, { withFileTypes: true });
  const images = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()),
    )
    .sort((first, second) => first.name.localeCompare(second.name));

  if (images.length === 0) {
    console.log('No image to convert in the uploads directory.');
    return;
  }

  for (const image of images) {
    const sourcePath = join(uploadsDirectory, image.name);
    const outputName = `${parse(image.name).name}.webp`;
    const outputPath = join(uploadsDirectory, outputName);

    await sharp(sourcePath).autoOrient().webp().toFile(outputPath);
    console.log(`Converted ${image.name} to ${outputName}`);
  }
}

convertImages().catch((error: unknown) => {
  console.error('Unable to convert images:', error);
  process.exitCode = 1;
});
