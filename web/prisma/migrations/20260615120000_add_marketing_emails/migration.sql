-- CreateEnum
CREATE TYPE "MarketingEmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "marketing_email" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "intro" TEXT,
    "content" TEXT NOT NULL,
    "note" TEXT,
    "status" "MarketingEmailStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "eligibleRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "sentRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailLastAttemptAt" TIMESTAMP(3),
    "emailLastError" TEXT,
    "createdByUserId" TEXT,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_email_status_scheduledFor_idx" ON "marketing_email"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "marketing_email_createdAt_idx" ON "marketing_email"("createdAt");
