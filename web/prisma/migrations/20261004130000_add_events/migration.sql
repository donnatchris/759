-- AlterTable
ALTER TABLE "blog_post" DROP COLUMN "displayEndDate",
DROP COLUMN "displayStartDate";

-- AlterTable
ALTER TABLE "marketing_email" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "tag" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "eventStartDate" TIMESTAMP(3),
    "eventEndDate" TIMESTAMP(3),
    "displayStartDate" TIMESTAMP(3),
    "displayEndDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "links" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_id_key" ON "event"("id");

-- Make the page available on existing installations without rerunning the full seed.
INSERT INTO "site_pages" ("slug", "title", "subTitle", "createdAt", "updatedAt")
VALUES ('evenements', 'Événements', 'Les prochains rendez-vous du 7.59.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
