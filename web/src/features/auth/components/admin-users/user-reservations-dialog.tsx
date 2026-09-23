import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReservationsCalendar } from '@/features/reservations/components/reservations-calendar';
import type { TAdminUserListItem } from '../../auth.types';
import { UserBookingStatusBadge } from './user-status-badges';

export function UserReservationsDialog({
  selectedUser,
  onOpenChange,
}: {
  selectedUser: TAdminUserListItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(selectedUser)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Réservations de {selectedUser?.name ?? 'l’utilisateur'}
          </DialogTitle>
          <DialogDescription>
            Calendrier des réservations associées au compte sélectionné.
          </DialogDescription>
        </DialogHeader>

        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/70 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-primary">
                  {selectedUser.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.phone ?? 'Téléphone non renseigné'}
                </p>
              </div>
              <UserBookingStatusBadge canBook={selectedUser.canBook} />
            </div>
            <ReservationsCalendar
              mode="admin"
              userId={selectedUser.id}
              height="68vh"
              showAdminActions={false}
              showCreateReservationAction
              reservationUser={selectedUser}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
