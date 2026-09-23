-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "sloganHead" TEXT,
    "sloganAccent" TEXT,
    "sloganTail" TEXT,
    "logoUrl" TEXT NOT NULL,
    "address" TEXT,
    "tel" TEXT,
    "activities" TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
