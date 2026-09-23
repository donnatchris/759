/*
  Warnings:

  - A unique constraint covering the columns `[label,categoryId]` on the table `service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "service_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "service_label_categoryId_key" ON "service"("label", "categoryId");
