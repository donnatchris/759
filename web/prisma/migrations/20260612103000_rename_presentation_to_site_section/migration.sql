-- CreateTable
CREATE TABLE "site_section" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subTitle" TEXT,
    "content" TEXT,
    "footer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_section_pkey" PRIMARY KEY ("id")
);

-- Preserve the existing homepage presentation row with a stable string id.
INSERT INTO "site_section" ("id", "title", "subTitle", "content", "footer", "createdAt", "updatedAt")
SELECT
    'presentation',
    "title",
    "subTitle",
    "content",
    "footer",
    "createdAt",
    "updatedAt"
FROM "presentation"
LIMIT 1;

-- DropTable
DROP TABLE "presentation";
