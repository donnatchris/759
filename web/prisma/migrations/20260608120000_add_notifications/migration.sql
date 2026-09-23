-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
    'NEW_RESERVATION',
    'RESERVATION_REMINDER',
    'RESERVATION_CANCELLATION',
    'CURRENT_EVENT_ANNOUNCEMENT',
    'NEW_USER_ADMIN_NOTIFICATION',
    'NEW_USER_WELCOME',
    'USER_ACCOUNT_DELETED_ADMIN_NOTIFICATION'
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "emailAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailLastAttemptAt" TIMESTAMP(3),
    "emailLastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_createdAt_idx" ON "notification"("userId", "isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
