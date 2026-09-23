-- Rename min notice setting from minutes to hours while preserving existing intent.
ALTER TABLE "booking_settings"
DROP CONSTRAINT IF EXISTS "booking_settings_positive_values_check";

ALTER TABLE "booking_settings"
RENAME COLUMN "minNoticeMinutes" TO "minNoticeHours";

UPDATE "booking_settings"
SET "minNoticeHours" = CEIL("minNoticeHours"::numeric / 60)::integer;

ALTER TABLE "booking_settings"
ALTER COLUMN "minNoticeHours" SET DEFAULT 2;

ALTER TABLE "booking_settings" ADD CONSTRAINT "booking_settings_positive_values_check" CHECK (
    "slotStepMinutes" > 0
    AND "minNoticeHours" >= 0
    AND "maxAdvanceDays" > 0
);
