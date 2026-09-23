-- CreateTable
CREATE TABLE "service_ressource" (
    "serviceId" TEXT NOT NULL,
    "ressourceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_ressource_pkey" PRIMARY KEY ("serviceId","ressourceId")
);

-- AddForeignKey
ALTER TABLE "service_ressource" ADD CONSTRAINT "service_ressource_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_ressource" ADD CONSTRAINT "service_ressource_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
