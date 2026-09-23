ALTER TABLE "reservation"
ADD COLUMN "bookedByName" TEXT;

UPDATE "reservation"
SET "bookedByName" = "user"."name"
FROM "user"
WHERE "reservation"."userId" = "user"."id"
  AND "reservation"."bookedByName" IS NULL;
