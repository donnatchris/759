-- DropCheckConstraint
ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "reservation_customerEmail_check";

-- AlterTable
ALTER TABLE "reservation" ALTER COLUMN "customerEmail" DROP NOT NULL;
