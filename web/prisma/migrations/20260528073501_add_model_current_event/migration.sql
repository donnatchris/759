CREATE TABLE "current_event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "current_event_id_key" ON "current_event"("id");
