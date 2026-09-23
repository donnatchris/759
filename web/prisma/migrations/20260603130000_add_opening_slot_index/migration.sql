-- AlterTable
ALTER TABLE "opening_slot" ADD COLUMN "slotIndex" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "opening_slot_dayOfWeek_slotIndex_key" ON "opening_slot"("dayOfWeek", "slotIndex");

-- AddCheckConstraint
ALTER TABLE "opening_slot" ADD CONSTRAINT "opening_slot_slotIndex_check" CHECK ("slotIndex" >= 1 AND "slotIndex" <= 2);
