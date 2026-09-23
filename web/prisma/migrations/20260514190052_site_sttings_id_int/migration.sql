/*
  Warnings:

  - The primary key for the `site_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `site_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");
