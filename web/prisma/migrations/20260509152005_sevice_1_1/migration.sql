/*
  Warnings:

  - The primary key for the `service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `services_category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `services_category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `categoryId` on the `service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "service" DROP CONSTRAINT "service_categoryId_fkey";

-- AlterTable
ALTER TABLE "service" DROP CONSTRAINT "service_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD CONSTRAINT "service_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "services_category" DROP CONSTRAINT "services_category_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "services_category_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "service" ADD CONSTRAINT "service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "services_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
