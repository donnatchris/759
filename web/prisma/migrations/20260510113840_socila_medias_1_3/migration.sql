-- AlterEnum
ALTER TYPE "SocialMediaType" ADD VALUE 'TWITTER';

-- AlterTable
ALTER TABLE "social_media" ADD COLUMN     "name" TEXT;
