/*
  Warnings:

  - The primary key for the `services_category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `services_category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_categoryId_fkey";

-- AlterTable
ALTER TABLE "service" ALTER COLUMN "categoryId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "services_category" DROP CONSTRAINT "services_category_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "services_category_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "services_category_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "services_category_id_key" ON "services_category"("id");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "services_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
