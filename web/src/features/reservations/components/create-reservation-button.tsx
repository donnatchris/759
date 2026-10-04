'use client';

import { isPrestationsEnabled } from '@/settings/settings.helpers';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarPlus, LogIn, Phone, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { DialogButton } from '@/components/custom-ui/dialog-button';
import { Button } from '@/components/ui/button';
import { useUser } from '@/features/auth/auth.context';
import { CreateReservationForm } from './create-reservation.form';
import { dispatchNotificationsUnreadCountChanged } from '@/features/notifications/lib/notifications.events';

type Props = {
  serviceId: string;
  serviceLabel: string;
  reservationPhone?: string | null;
};

export function CreateReservationButton({
  serviceId,
  serviceLabel,
  reservationPhone,
}: Props) {
  const { user } = useUser();
  const router = useRouter();
  const onSuccess = () => {
    dispatchNotificationsUnreadCountChanged({ delta: 1 });
    toast.success(
      'Réservation enregistrée. Vous allez être redirigé vers votre calendrier.',
      {
        position: 'top-center',
      },
    );
    router.push('/dashboard#reservations');
  };
  const hasPhone = Boolean(user?.phone);
  const title = user
    ? hasPhone
      ? 'Réserver une prestation'
      : 'Téléphone requis'
    : 'Connexion requise';
  const subTitle = user
    ? hasPhone
      ? 'Choisissez un créneau disponible pour réserver avec vos informations de compte.'
      : 'Ajoutez votre numéro de téléphone avant de réserver en ligne.'
    : 'Connectez-vous pour réserver en ligne, ou contactez-nous par téléphone.';

  if (!isPrestationsEnabled()) return null;

  return (
    <DialogButton
      title={title}
      subTitle={subTitle}
      buttonLabel={
        <span className="inline-flex items-center gap-1">
          <CalendarPlus className="h-4 w-4" />
          Réserver
        </span>
      }
      buttonVariant="default"
      buttonSize="sm"
      buttonClassName="rounded-full"
    >
      {!user ? (
        <ReservationLoginPrompt reservationPhone={reservationPhone} />
      ) : !hasPhone ? (
        <MissingPhonePrompt />
      ) : (
        <CreateReservationForm
          serviceId={serviceId}
          serviceLabel={serviceLabel}
          onSuccess={onSuccess}
        />
      )}
    </DialogButton>
  );
}

function ReservationLoginPrompt({
  reservationPhone,
}: {
  reservationPhone?: string | null;
}) {
  const phoneHref = reservationPhone
    ? `tel:${reservationPhone.replace(/\D/g, '')}`
    : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
        <p className="font-semibold text-primary">Réservation en ligne</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Connectez-vous à votre compte pour choisir un créneau et confirmer la
          réservation avec vos informations enregistrées.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild className="rounded-xl">
          <Link href="/auth/sign-in">
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
        </Button>

        {phoneHref && (
          <Button asChild variant="outline" className="rounded-xl">
            <a href={phoneHref}>
              <Phone className="h-4 w-4" />
              Réserver par téléphone : {reservationPhone}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function MissingPhonePrompt() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
        <p className="font-semibold text-primary">Numéro de téléphone requis</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre numéro de téléphone sera utilisé pour confirmer les
          réservations. Ajoutez-le dans votre compte avant de réserver.
        </p>
      </div>

      <Button asChild className="w-fit rounded-xl">
        <Link href="/dashboard">
          <UserRound className="h-4 w-4" />
          Gérer mon compte utilisateur
        </Link>
      </Button>
    </div>
  );
}
