import type { ServicesCategory, Service, Ressource } from '@prisma/client';
import { Prisma } from '@prisma/client';

export { ServicesCategory, Service, Ressource };

export type TServicesCategoryWithServices = Prisma.ServicesCategoryGetPayload<{
  include: {
    services: true;
  };
}>;

export type TServicesCategoryWithServicesAndRessources =
  Prisma.ServicesCategoryGetPayload<{
    include: {
      services: {
        include: {
          serviceRessources: {
            include: {
              ressource: true;
            };
          };
        };
      };
    };
  }>;

export type TServiceWithRessources = Prisma.ServiceGetPayload<{
  include: {
    serviceRessources: {
      include: {
        ressource: true;
      };
    };
  };
}>;

export const SERVICES_CATEGORIES_CACHE_KEY = ['services-categories'];
export const SERVICES_CATEGORIES_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const SERVICES_CATEGORIES_CACHE_TAG = 'services-categories';
