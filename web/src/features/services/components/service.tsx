import { type TServiceWithRessources, Ressource } from '../lib/services.types';
import { DeleteService } from './delete-service';
import { EditServiceAdminButton } from './edit-service-admin-button';
import { CreateReservationButton } from '@/features/reservations';

type Props = {
  service: TServiceWithRessources;
  ressources: Ressource[];
  reservationPhone?: string | null;
  onlineBookingEnabled: boolean;
};

export function Service({
  service,
  ressources,
  reservationPhone,
  onlineBookingEnabled,
}: Props) {
  const bookable = service.bookable && onlineBookingEnabled;
  return (
    <div className="group relative rounded-md bg-background/65 p-5 transition-colors hover:bg-muted/60">
      <div className="absolute -top-2 right-2 z-20 flex gap-2">
        <EditServiceAdminButton service={service} ressources={ressources} />
        <DeleteService id={service.id} />
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4 text-foreground">
        <h4 className="min-w-0 flex-1 font-heading text-xl font-bold">
          {service.label}
        </h4>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {service.price && <p className="font-bold">{service.price}</p>}
          {bookable && (
            <CreateReservationButton
              serviceId={service.id}
              serviceLabel={service.label}
              reservationPhone={reservationPhone}
            />
          )}
        </div>
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {service.details}
      </p>
    </div>
  );
}
