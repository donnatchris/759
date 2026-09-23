/*
  Warnings:

  - The primary key for the `service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "service" DROP CONSTRAINT "service_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "service_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "service_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "service_id_key" ON "service"("id");
