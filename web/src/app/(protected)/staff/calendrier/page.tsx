import { ReservationsCalendar } from '@/features/reservations/components/reservations-calendar';
import { getAppointmentUsersService } from '@/features/reservations/lib/reservations.service';
import { BackLink } from '@/components/custom-ui/back-link';

export default async function AdminCalendarPage() {
  const users = await getAppointmentUsersService();

  return (
    <main className="container mx-auto px-4 py-8">
      <BackLink href="/staff" className="mb-2 text-xs sm:text-sm">
        Retour à l’Espace Staff
      </BackLink>

      <div className="mb-8">
        <h1 className="font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
          Calendrier Staff
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Suivez les réservations, ajoutez des réservations manuelles, déclarez
          des fermetures et immobilisez des ressources.
        </p>
      </div>

      <ReservationsCalendar mode="admin" adminUsers={users} />
    </main>
  );
}
