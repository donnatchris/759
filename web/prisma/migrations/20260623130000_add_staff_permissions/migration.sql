-- CreateTable
CREATE TABLE "staff_permission" (
    "userId" TEXT NOT NULL,
    "canManageAppointments" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canManageMarketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_permission_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "staff_permission" ADD CONSTRAINT "staff_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
