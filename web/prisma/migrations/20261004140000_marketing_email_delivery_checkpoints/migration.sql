ALTER TABLE "marketing_email"
ADD COLUMN "deliverySnapshot" JSONB,
ADD COLUMN "nextBatchIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "batchAttemptedAt" TIMESTAMP(3),
ADD COLUMN "sendLeaseToken" TEXT,
ADD COLUMN "sendLeaseExpiresAt" TIMESTAMP(3),
ADD COLUMN "nextAttemptAt" TIMESTAMP(3),
ADD COLUMN "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "requiresReview" BOOLEAN NOT NULL DEFAULT false;

-- Legacy attempted campaigns have no reliable checkpoint. Do not resend them blindly.
UPDATE "marketing_email"
SET "requiresReview" = true, "status" = 'FAILED',
    "emailLastError" = 'Ancienne campagne sans suivi des lots : vérifier les envois dans Resend avant toute reprise.'
WHERE "sentAt" IS NULL AND ("emailAttempts" > 0 OR "status" = 'SENDING');

CREATE TABLE "marketing_email_dispatch_clock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nextSlotAt" TIMESTAMP(3) NOT NULL
);
