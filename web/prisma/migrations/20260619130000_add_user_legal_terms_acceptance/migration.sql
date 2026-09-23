ALTER TABLE "user"
ADD COLUMN "legalTermsAccepted" BOOLEAN,
ADD COLUMN "legalTermsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "acceptedLegalTermsId" TEXT;

CREATE INDEX "user_acceptedLegalTermsId_idx" ON "user"("acceptedLegalTermsId");

ALTER TABLE "user"
ADD CONSTRAINT "user_acceptedLegalTermsId_fkey"
FOREIGN KEY ("acceptedLegalTermsId")
REFERENCES "legal_terms"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
