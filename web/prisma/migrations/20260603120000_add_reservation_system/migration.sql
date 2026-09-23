-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_resource_usage" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "ressourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_resource_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_slot" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAtMinute" INTEGER NOT NULL,
    "closesAtMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opening_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_exception" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "label" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opening_exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_exception_slot" (
    "id" SERIAL NOT NULL,
    "exceptionId" INTEGER NOT NULL,
    "opensAtMinute" INTEGER NOT NULL,
    "closesAtMinute" INTEGER NOT NULL,

    CONSTRAINT "opening_exception_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_unavailable_period" (
    "id" TEXT NOT NULL,
    "ressourceId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_unavailable_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "slotStepMinutes" INTEGER NOT NULL DEFAULT 15,
    "minNoticeMinutes" INTEGER NOT NULL DEFAULT 120,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservation_serviceId_idx" ON "reservation"("serviceId");

-- CreateIndex
CREATE INDEX "reservation_userId_idx" ON "reservation"("userId");

-- CreateIndex
CREATE INDEX "reservation_startsAt_idx" ON "reservation"("startsAt");

-- CreateIndex
CREATE INDEX "reservation_status_idx" ON "reservation"("status");

-- CreateIndex
CREATE INDEX "reservation_resource_usage_ressourceId_startAt_endAt_idx" ON "reservation_resource_usage"("ressourceId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "reservation_resource_usage_reservationId_idx" ON "reservation_resource_usage"("reservationId");

-- CreateIndex
CREATE INDEX "reservation_resource_usage_status_idx" ON "reservation_resource_usage"("status");

-- CreateIndex
CREATE INDEX "opening_slot_dayOfWeek_idx" ON "opening_slot"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "opening_exception_date_key" ON "opening_exception"("date");

-- CreateIndex
CREATE INDEX "resource_unavailable_period_ressourceId_startAt_endAt_idx" ON "resource_unavailable_period"("ressourceId", "startAt", "endAt");

-- AddCheckConstraint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_customerEmail_check" CHECK (length(trim("customerEmail")) > 0);

-- AddCheckConstraint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_customerPhone_check" CHECK (length(trim("customerPhone")) > 0);

-- AddCheckConstraint
ALTER TABLE "reservation_resource_usage" ADD CONSTRAINT "reservation_resource_usage_quantity_check" CHECK ("quantity" > 0);

-- AddCheckConstraint
ALTER TABLE "reservation_resource_usage" ADD CONSTRAINT "reservation_resource_usage_interval_check" CHECK ("endAt" > "startAt");

-- AddCheckConstraint
ALTER TABLE "opening_slot" ADD CONSTRAINT "opening_slot_dayOfWeek_check" CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6);

-- AddCheckConstraint
ALTER TABLE "opening_slot" ADD CONSTRAINT "opening_slot_minutes_check" CHECK ("opensAtMinute" >= 0 AND "opensAtMinute" < "closesAtMinute" AND "closesAtMinute" <= 1440);

-- AddCheckConstraint
ALTER TABLE "opening_exception_slot" ADD CONSTRAINT "opening_exception_slot_minutes_check" CHECK ("opensAtMinute" >= 0 AND "opensAtMinute" < "closesAtMinute" AND "closesAtMinute" <= 1440);

-- AddCheckConstraint
ALTER TABLE "resource_unavailable_period" ADD CONSTRAINT "resource_unavailable_period_quantity_check" CHECK ("quantity" IS NULL OR "quantity" > 0);

-- AddCheckConstraint
ALTER TABLE "resource_unavailable_period" ADD CONSTRAINT "resource_unavailable_period_interval_check" CHECK ("endAt" > "startAt");

-- AddCheckConstraint
ALTER TABLE "booking_settings" ADD CONSTRAINT "booking_settings_singleton_check" CHECK ("id" = 1);

-- AddCheckConstraint
ALTER TABLE "booking_settings" ADD CONSTRAINT "booking_settings_positive_values_check" CHECK (
    "slotStepMinutes" > 0
    AND "minNoticeMinutes" >= 0
    AND "maxAdvanceDays" > 0
);

-- Seed singleton settings row.
INSERT INTO "booking_settings" ("id", "updatedAt")
VALUES (1, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_resource_usage" ADD CONSTRAINT "reservation_resource_usage_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_resource_usage" ADD CONSTRAINT "reservation_resource_usage_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "ressource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_exception_slot" ADD CONSTRAINT "opening_exception_slot_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "opening_exception"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_unavailable_period" ADD CONSTRAINT "resource_unavailable_period_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Capacity validation for reservation resource usages.
CREATE OR REPLACE FUNCTION "validate_reservation_resource_usage_capacity"()
RETURNS TRIGGER AS $$
DECLARE
    total_quantity INTEGER;
    reserved_quantity INTEGER;
    unavailable_quantity INTEGER;
BEGIN
    IF NEW."status" NOT IN ('PENDING', 'CONFIRMED') THEN
        RETURN NEW;
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended(NEW."ressourceId", 0));

    SELECT "quantity"
    INTO total_quantity
    FROM "ressource"
    WHERE "id" = NEW."ressourceId"
    FOR UPDATE;

    IF total_quantity IS NULL THEN
        RAISE EXCEPTION 'Ressource % does not exist', NEW."ressourceId";
    END IF;

    SELECT COALESCE(SUM("quantity"), 0)
    INTO reserved_quantity
    FROM "reservation_resource_usage"
    WHERE "ressourceId" = NEW."ressourceId"
      AND "status" IN ('PENDING', 'CONFIRMED')
      AND "id" <> NEW."id"
      AND "startAt" < NEW."endAt"
      AND "endAt" > NEW."startAt";

    SELECT COALESCE(SUM(COALESCE("quantity", total_quantity)), 0)
    INTO unavailable_quantity
    FROM "resource_unavailable_period"
    WHERE "ressourceId" = NEW."ressourceId"
      AND "startAt" < NEW."endAt"
      AND "endAt" > NEW."startAt";

    IF reserved_quantity + unavailable_quantity + NEW."quantity" > total_quantity THEN
        RAISE EXCEPTION 'Ressource % capacity exceeded for interval [% - %]', NEW."ressourceId", NEW."startAt", NEW."endAt";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "reservation_resource_usage_capacity_trigger"
BEFORE INSERT OR UPDATE ON "reservation_resource_usage"
FOR EACH ROW
EXECUTE FUNCTION "validate_reservation_resource_usage_capacity"();

-- Capacity validation for manual resource unavailability periods.
CREATE OR REPLACE FUNCTION "validate_resource_unavailable_period_capacity"()
RETURNS TRIGGER AS $$
DECLARE
    total_quantity INTEGER;
    reserved_quantity INTEGER;
    unavailable_quantity INTEGER;
    new_unavailable_quantity INTEGER;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW."ressourceId", 0));

    SELECT "quantity"
    INTO total_quantity
    FROM "ressource"
    WHERE "id" = NEW."ressourceId"
    FOR UPDATE;

    IF total_quantity IS NULL THEN
        RAISE EXCEPTION 'Ressource % does not exist', NEW."ressourceId";
    END IF;

    new_unavailable_quantity := COALESCE(NEW."quantity", total_quantity);

    SELECT COALESCE(SUM("quantity"), 0)
    INTO reserved_quantity
    FROM "reservation_resource_usage"
    WHERE "ressourceId" = NEW."ressourceId"
      AND "status" IN ('PENDING', 'CONFIRMED')
      AND "startAt" < NEW."endAt"
      AND "endAt" > NEW."startAt";

    SELECT COALESCE(SUM(COALESCE("quantity", total_quantity)), 0)
    INTO unavailable_quantity
    FROM "resource_unavailable_period"
    WHERE "ressourceId" = NEW."ressourceId"
      AND "id" <> NEW."id"
      AND "startAt" < NEW."endAt"
      AND "endAt" > NEW."startAt";

    IF reserved_quantity + unavailable_quantity + new_unavailable_quantity > total_quantity THEN
        RAISE EXCEPTION 'Ressource % capacity exceeded by unavailable period [% - %]', NEW."ressourceId", NEW."startAt", NEW."endAt";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "resource_unavailable_period_capacity_trigger"
BEFORE INSERT OR UPDATE ON "resource_unavailable_period"
FOR EACH ROW
EXECUTE FUNCTION "validate_resource_unavailable_period_capacity"();
