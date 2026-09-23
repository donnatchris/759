ALTER TABLE "reservation"
ADD COLUMN "bookedBy" TEXT,
ADD COLUMN "bookedByRole" "UserRole";

UPDATE "reservation"
SET
    "bookedBy" = "user"."email",
    "bookedByRole" = "user"."role"
FROM "user"
WHERE "reservation"."userId" = "user"."id"
  AND "reservation"."bookedBy" IS NULL;
