/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `social_media` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "site_pages" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_pages_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_pages_slug_key" ON "site_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "social_media_id_key" ON "social_media"("id");
