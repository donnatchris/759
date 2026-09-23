import { getCurrentUserUpcomingReservationsCountAction } from '../lib/reservations.action';

export async function UpcomingReservationsSummary() {
  const response = await getCurrentUserUpcomingReservationsCountAction();

  if (!response.success) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Impossible de charger le nombre de réservations à venir.
      </p>
    );
  }

  const count = response.data;
  const label =
    count > 0
      ? `Vous avez ${count} réservation${count > 1 ? 's' : ''} à venir.`
      : 'Pas de réservation à venir pour le moment.';

  return (
    <p className="rounded-lg border border-primary/20 bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground">
      {label}
    </p>
  );
}
