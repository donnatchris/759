CREATE TABLE "dish_category" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT,
    "imageUrl" TEXT NOT NULL,
    "infos" TEXT,
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dish_category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dish" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" TEXT,
    "details" TEXT,
    "imageUrl" TEXT NOT NULL,
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "dish_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dish_category_label_key" ON "dish_category"("label");

CREATE UNIQUE INDEX "dish_label_categoryId_key" ON "dish"("label", "categoryId");

ALTER TABLE "dish" ADD CONSTRAINT "dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "dish_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
