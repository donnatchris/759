/*
  Warnings:

  - You are about to drop the `ressources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ressources";

-- CreateTable
CREATE TABLE "ressource" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ressource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ressource_id_key" ON "ressource"("id");
