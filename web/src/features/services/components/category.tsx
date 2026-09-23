import {
  DeleteServiceCategory,
  EditOfferingSummaryAdminButton,
  type TServicesCategoryWithServicesAndRessources,
  type Ressource,
} from '@/features/services';
import Image from 'next/image';
import { Info } from 'lucide-react';
import { Service } from './service';
import { CreateServiceAdminButton } from './create-service-admin-button';

type Props = {
  servicesCategory: TServicesCategoryWithServicesAndRessources;
  ressources: Ressource[];
  imagePriority?: boolean;
  reservationPhone?: string | null;
  onlineBookingEnabled: boolean;
};

export function Category({
  servicesCategory,
  ressources,
  imagePriority = false,
  reservationPhone,
  onlineBookingEnabled,
}: Props) {
  const id = String(servicesCategory.id);
  const text =
    servicesCategory.longDescription ?? servicesCategory.shortDescription;
  return (
    <div>
      <div
        className="grid scroll-mt-24 overflow-hidden rounded-md bg-card lg:grid-cols-[.75fr_1.25fr]"
        id={id}
      >
        <div className="relative flex min-h-72 flex-col justify-end gap-3 overflow-hidden bg-primary p-8 text-primary-foreground">
          <div className="absolute top-2 right-2 z-20 flex gap-2">
            <CreateServiceAdminButton serviceId={id} ressources={ressources} />
            <EditOfferingSummaryAdminButton category={servicesCategory} />
            <DeleteServiceCategory id={id} />
          </div>
          <Image
            src={servicesCategory.imageUrl}
            alt={servicesCategory.label}
            width={800}
            height={400}
            sizes="(max-width: 640px) 100vw, 800px"
            loading={imagePriority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
          <h3 className="relative font-heading text-4xl font-medium leading-none">
            {servicesCategory.label}
          </h3>
          <p className="relative whitespace-pre-line text-sm leading-6 text-primary-foreground/75">
            {text}
          </p>
        </div>
        <div className="p-5 sm:p-8">
          <main className="flex flex-col gap-3">
            {servicesCategory.services.map((service) => (
              <Service
                key={service.id}
                service={service}
                ressources={ressources}
                reservationPhone={reservationPhone}
                onlineBookingEnabled={onlineBookingEnabled}
              />
            ))}
          </main>
        </div>
        {servicesCategory.infos && (
          <div className="flex items-center gap-2 bg-muted/40 p-5 text-muted-foreground lg:col-span-2">
            <Info className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">{servicesCategory.infos}</span>
          </div>
        )}
      </div>
    </div>
  );
}
