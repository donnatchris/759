-- CreateTable
CREATE TABLE "banned_email" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banned_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banned_email_email_key" ON "banned_email"("email");

-- AlterTable
ALTER TABLE "user" DROP COLUMN "banned",
ADD COLUMN     "canBook" BOOLEAN NOT NULL DEFAULT true;
