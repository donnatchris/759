-- CreateEnum
CREATE TYPE "SocialMediaType" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'SNAPCHAT', 'WHATSAPP');

-- CreateTable
CREATE TABLE "social_media" (
    "id" "SocialMediaType" NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);
