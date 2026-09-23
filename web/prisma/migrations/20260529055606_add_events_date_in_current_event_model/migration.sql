-- AlterTable
ALTER TABLE "current_event" ADD COLUMN     "displayEndDate" TIMESTAMP(3),
ADD COLUMN     "displayStartDate" TIMESTAMP(3),
ADD COLUMN     "eventEndDate" TIMESTAMP(3),
ADD COLUMN     "eventStartDate" TIMESTAMP(3),
ALTER COLUMN "links" DROP DEFAULT;
