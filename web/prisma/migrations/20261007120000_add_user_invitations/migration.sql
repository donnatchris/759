CREATE TABLE "user_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "invitedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_invitation_email_key" ON "user_invitation"("email");
CREATE UNIQUE INDEX "user_invitation_tokenHash_key" ON "user_invitation"("tokenHash");
