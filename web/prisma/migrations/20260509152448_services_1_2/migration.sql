/*
  Warnings:

  - You are about to drop the column `icon` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `longDescription` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `service` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `services_category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[label]` on the table `service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[label]` on the table `services_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label` to the `service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `services_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `services_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `services_category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "service_title_key";

-- DropIndex
DROP INDEX "services_category_name_key";

-- AlterTable
ALTER TABLE "service" DROP COLUMN "icon",
DROP COLUMN "imageUrl",
DROP COLUMN "longDescription",
DROP COLUMN "shortDescription",
DROP COLUMN "title",
ADD COLUMN     "label" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services_category" DROP COLUMN "name",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "service_label_key" ON "service"("label");

-- CreateIndex
CREATE UNIQUE INDEX "services_category_label_key" ON "services_category"("label");
