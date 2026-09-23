ALTER TABLE "ressource" ADD COLUMN "color" TEXT NOT NULL DEFAULT '#d97706';

UPDATE "ressource"
SET "color" = '#16a34a'
WHERE "id" = 'naima';
