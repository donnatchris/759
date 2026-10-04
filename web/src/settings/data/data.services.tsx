import type {
  Service,
  ServicesCategory,
  Ressource,
  ServiceRessource,
} from '@prisma/client';

type TServiceCategory = Omit<ServicesCategory, 'createdAt' | 'updatedAt'>;
type TService = Omit<Service, 'createdAt' | 'updatedAt'>;

// Neutral demonstration data. Replace it before the first production seed or
// edit it from the administration interface after local initialization.
export const initialRessources: Omit<Ressource, 'createdAt' | 'updatedAt'>[] =
  [];

export const siteServicesCategories: TServiceCategory[] = [];

export const siteServices: TService[] = [];

export const siteServiceRessources: Omit<
  ServiceRessource,
  'createdAt' | 'updatedAt'
>[] = [];

export const siteServiceRessourcesByServiceId = siteServiceRessources.reduce<
  Record<string, Omit<ServiceRessource, 'createdAt' | 'updatedAt'>[]>
>((acc, serviceRessource) => {
  const { serviceId } = serviceRessource;
  if (!acc[serviceId]) acc[serviceId] = [];
  acc[serviceId].push(serviceRessource);
  return acc;
}, {});
