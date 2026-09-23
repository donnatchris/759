CREATE TABLE "legal_terms" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_terms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legal_terms_id_key" ON "legal_terms"("id");
