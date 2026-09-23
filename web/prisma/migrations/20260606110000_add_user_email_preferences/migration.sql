-- AlterTable
ALTER TABLE "user" ADD COLUMN     "canReceiveMarketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canReceiveReservationEmails" BOOLEAN NOT NULL DEFAULT false;
