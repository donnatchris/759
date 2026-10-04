import { UserProfile } from '@/features/auth/components/user-profile';
import { CTAButton } from '@/components/landing-page/CTAButton';
import { ReservationsCalendar } from '@/features/reservations/components/reservations-calendar';
import { UpcomingReservationsSummary } from '@/features/reservations/components/upcoming-reservations-summary';
import { isPrestationsEnabled } from '@/settings/settings.helpers';

export default async function UserDashboard() {
  const title = 'Mon compte utilisateur';
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl sm:text-6xl font-bold font-brand text-center mb-8 p-4 text-primary tracking-wide">
        {title}
      </h1>

      <div className="fixed bottom-5 right-5 z-50">
        <CTAButton />
      </div>

      <UserProfile />

      {isPrestationsEnabled() && (
        <section id="reservations" className="mt-8 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-primary">Mes réservations</h2>
          <UpcomingReservationsSummary />
          <ReservationsCalendar mode="user" height="65vh" />
        </section>
      )}
    </div>
  );
}
