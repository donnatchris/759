-- CreateTable
CREATE TABLE "presentation" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT,
    "subTitle" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentation_pkey" PRIMARY KEY ("id")
);
