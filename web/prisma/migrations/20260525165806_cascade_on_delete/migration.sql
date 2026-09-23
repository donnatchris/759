-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "services_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
