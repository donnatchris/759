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
export const initialRessources: Omit<Ressource, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'equipe-principale',
    label: 'Équipe principale',
    quantity: 1,
    color: '#2563eb',
  },
];

export const siteServicesCategories: TServiceCategory[] = [
  {
    id: 'services',
    label: 'Services',
    shortDescription: 'Découvrez les services proposés par notre équipe.',
    longDescription:
      'Cette catégorie et ses prestations sont des exemples à personnaliser depuis les données du template ou depuis l’administration.',
    infos: null,
    imageUrl: '/placeholder.svg',
    orderIndex: 1,
  },
];

export const siteServices: TService[] = [
  {
    id: 'service-decouverte',
    label: 'Service découverte',
    details: 'Exemple de prestation à remplacer par votre propre offre.',
    price: null,
    categoryId: 'services',
    orderIndex: 1,
    bookable: true,
  },
];

export const siteServiceRessources: Omit<
  ServiceRessource,
  'createdAt' | 'updatedAt'
>[] = [
  {
    ressourceId: 'equipe-principale',
    serviceId: 'service-decouverte',
    quantity: 1,
    durationInMinutes: 60,
    offsetInMinutes: 0,
  },
];

export const siteServiceRessourcesByServiceId = siteServiceRessources.reduce<
  Record<string, Omit<ServiceRessource, 'createdAt' | 'updatedAt'>[]>
>((acc, serviceRessource) => {
  const { serviceId } = serviceRessource;
  if (!acc[serviceId]) acc[serviceId] = [];
  acc[serviceId].push(serviceRessource);
  return acc;
}, {});
