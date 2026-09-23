-- CreateEnum
CREATE TYPE "ReservationCancelledBy" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "reservation" ADD COLUMN "cancelledBy" "ReservationCancelledBy";
