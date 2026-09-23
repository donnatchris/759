'use client';

import { useCallback, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import type {
  EventClickArg,
  EventContentArg,
  EventInput,
  EventMountArg,
  EventSourceFunc,
  EventSourceFuncArg,
  FormatterInput,
} from '@fullcalendar/core';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ban, CalendarPlus, CalendarX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/features/core/responsive/responsive.hook';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { useUser } from '@/features/auth/auth.context';
import {
  getAdminUserReservationsCalendarAction,
  getCurrentUserReservationDetailsAction,
  getCurrentUserReservationsCalendarAction,
  getReservationDetailsAction,
  getReservationsCalendarAction,
} from '@/features/reservations/lib/reservations.action';
import { getOpeningClosureCalendarEventsAction } from '@/features/opening-slots/lib/opening-slots.action';
import { CreateOpeningClosureForm } from '@/features/opening-slots/components/create-opening-closure.form';
import { UpdateOpeningClosureForm } from '@/features/opening-slots/components/update-opening-closure.form';
import type { TOpeningClosureCalendarEvent } from '@/features/opening-slots/lib/opening-slots.types';
import { getResourceUnavailableCalendarEventsAction } from '@/features/ressource/lib/ressource.action';
import { CreateResourceUnavailablePeriodForm } from '@/features/ressource/components/create-resource-unavailable-period.form';
import { UpdateResourceUnavailablePeriodForm } from '@/features/ressource/components/update-resource-unavailable-period.form';
import type { TResourceUnavailableCalendarEvent } from '@/features/ressource/lib/ressource.types';
import { CancelReservationForm } from './cancel-reservation.form';
import { CreateAdminReservationForm } from './create-admin-reservation.form';
import type {
  TCalendarReservation,
  TReservationDetails,
} from '@/features/reservations/lib/reservations.types';
import {
  formatDateInputValue,
  isTodayOrFutureReservationDate,
} from '@/features/reservations/lib/reservations.types';
import type { TAdminUserListItem } from '@/features/auth/auth.types';

type TReservationsCalendarMode = 'admin' | 'user';

type TReservationsCalendarProps = {
  mode?: TReservationsCalendarMode;
  userId?: string;
  height?: string;
  adminUsers?: TAdminUserListItem[];
  showAdminActions?: boolean;
  showCreateReservationAction?: boolean;
  reservationUser?: TAdminUserListItem;
};

export function ReservationsCalendar({
  mode = 'admin',
  userId,
  height = '70vh',
  adminUsers = [],
  showAdminActions,
  showCreateReservationAction,
  reservationUser,
}: TReservationsCalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { isAdmin, user } = useUser();
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<TReservationDetails | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState(() =>
    formatDateInputValue(new Date()),
  );
  const [closureOpen, setClosureOpen] = useState(false);
  const [selectedOpeningClosure, setSelectedOpeningClosure] =
    useState<TOpeningClosureCalendarEvent | null>(null);
  const [resourceUnavailableOpen, setResourceUnavailableOpen] = useState(false);
  const [selectedResourceUnavailable, setSelectedResourceUnavailable] =
    useState<TResourceUnavailableCalendarEvent | null>(null);

  const headerToolbar = isMobile
    ? {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek',
      }
    : {
        start: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      };
  const titleFormat: FormatterInput = isMobile
    ? { month: 'numeric', year: 'numeric' }
    : { month: 'long', year: 'numeric' };
  const hasStaffAreaAccess = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const canLoadCalendar = mode === 'admin' ? hasStaffAreaAccess : Boolean(user);
  const canShowStaffActions = showAdminActions ?? (mode === 'admin' && !userId);
  const canShowAdminActions = canShowStaffActions && isAdmin;
  const canShowCreateReservationAction =
    showCreateReservationAction ?? canShowStaffActions;

  const handleReservationCancelled = useCallback(
    (reservation: TReservationDetails) => {
      setSelectedReservation(reservation);
      setDetailsOpen(false);
      calendarRef.current?.getApi().refetchEvents();
      toast.success('Réservation annulée.', {
        position: 'top-center',
      });
      router.refresh();
    },
    [router],
  );

  const handleReservationCreated = useCallback(() => {
    setCreateOpen(false);
    calendarRef.current?.getApi().refetchEvents();
    toast.success('Réservation enregistrée.', {
      position: 'top-center',
    });
    router.refresh();
  }, [router]);

  const handleClosureCreated = useCallback(() => {
    setClosureOpen(false);
    setSelectedOpeningClosure(null);
    calendarRef.current?.getApi().refetchEvents();
    toast.success('Période de fermeture enregistrée.', {
      position: 'top-center',
    });
    router.refresh();
  }, [router]);

  const handleClosureUpdated = useCallback(() => {
    setClosureOpen(false);
    setSelectedOpeningClosure(null);
    calendarRef.current?.getApi().refetchEvents();
    router.refresh();
  }, [router]);

  const handleResourceUnavailableCreated = useCallback(() => {
    setResourceUnavailableOpen(false);
    setSelectedResourceUnavailable(null);
    calendarRef.current?.getApi().refetchEvents();
    toast.success('Immobilisation de ressource enregistrée.', {
      position: 'top-center',
    });
    router.refresh();
  }, [router]);

  const handleResourceUnavailableUpdated = useCallback(() => {
    setResourceUnavailableOpen(false);
    setSelectedResourceUnavailable(null);
    calendarRef.current?.getApi().refetchEvents();
    router.refresh();
  }, [router]);

  const openCreateReservationDialog = useCallback(() => {
    setCreateDate(formatDateInputValue(new Date()));
    setCreateOpen(true);
  }, []);

  const openCreateResourceUnavailableDialog = useCallback(() => {
    setSelectedResourceUnavailable(null);
    setResourceUnavailableOpen(true);
  }, []);

  const openCreateOpeningClosureDialog = useCallback(() => {
    setSelectedOpeningClosure(null);
    setClosureOpen(true);
  }, []);

  const fetchReservations: EventSourceFunc = useCallback(
    async (fetchInfo: EventSourceFuncArg) => {
      if (!canLoadCalendar) return [];

      const input = {
        start: fetchInfo.start.toISOString(),
        end: fetchInfo.end.toISOString(),
      };
      const reservationResponse =
        mode === 'admin' && userId
          ? await getAdminUserReservationsCalendarAction({
              ...input,
              userId,
            })
          : mode === 'admin'
            ? await getReservationsCalendarAction(input)
            : await getCurrentUserReservationsCalendarAction(input);
      const closureResponse =
        mode === 'admin'
          ? await getOpeningClosureCalendarEventsAction(input)
          : null;
      const resourceUnavailableResponse =
        mode === 'admin'
          ? await getResourceUnavailableCalendarEventsAction(input)
          : null;

      if (!reservationResponse.success) {
        setCalendarError(getErrorMessageFromResponse(reservationResponse));
        return [];
      }
      if (closureResponse && !closureResponse.success) {
        setCalendarError(getErrorMessageFromResponse(closureResponse));
        return [];
      }
      if (resourceUnavailableResponse && !resourceUnavailableResponse.success) {
        setCalendarError(
          getErrorMessageFromResponse(resourceUnavailableResponse),
        );
        return [];
      }

      setCalendarError(null);
      return [
        ...reservationResponse.data.map((reservation) =>
          toCalendarEvent(reservation, mode),
        ),
        ...(closureResponse?.data.map(toOpeningClosureEvent) ?? []),
        ...(resourceUnavailableResponse?.data.map(toResourceUnavailableEvent) ??
          []),
      ];
    },
    [canLoadCalendar, mode, userId],
  );

  const onEventClick = async (info: EventClickArg) => {
    info.jsEvent.preventDefault();

    if (info.event.extendedProps.eventKind === 'openingClosure') {
      if (!isAdmin) return;
      const closure = info.event.extendedProps
        .openingClosure as TOpeningClosureCalendarEvent;

      setSelectedOpeningClosure(closure);
      setClosureOpen(true);
      return;
    }

    if (info.event.extendedProps.eventKind === 'resourceUnavailable') {
      if (!isAdmin) return;
      const period = info.event.extendedProps
        .resourceUnavailablePeriod as TResourceUnavailableCalendarEvent;

      setSelectedResourceUnavailable(period);
      setResourceUnavailableOpen(true);
      return;
    }

    const reservationId = info.event.id;
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedReservation(null);

    try {
      const response =
        mode === 'admin'
          ? await getReservationDetailsAction({ id: reservationId })
          : await getCurrentUserReservationDetailsAction({ id: reservationId });

      if (!response.success) {
        setDetailsError(getErrorMessageFromResponse(response));
        return;
      }

      setSelectedReservation(response.data);
    } catch {
      setDetailsError('Impossible de charger les détails de la réservation.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const onEventDidMount = (info: EventMountArg) => {
    const colors = getEventColors(info.event.extendedProps.resourceColors);
    if (colors.length === 0) return;

    const background =
      colors.length === 1
        ? colors[0]
        : `repeating-linear-gradient(135deg, ${colors[0]} 0 8px, ${colors[1]} 8px 16px)`;

    info.el.style.background = background;
    info.el.style.borderColor = colors[0];
    info.el.style.color = '#ffffff';
    info.el.style.textShadow = '0 1px 1px rgba(0, 0, 0, 0.4)';
  };

  if (!canLoadCalendar) {
    return (
      <div className="rounded-xl border border-primary/20 bg-background/70 p-6 text-sm text-muted-foreground">
        {mode === 'admin'
          ? 'Le calendrier des réservations est réservé aux membres autorisés de l’Espace Staff.'
          : 'Connectez-vous pour consulter vos réservations.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {(canShowAdminActions || canShowCreateReservationAction) && (
        <div className="flex flex-wrap justify-start gap-2">
          {canShowAdminActions && (
            <>
              <Button
                type="button"
                variant="default"
                onClick={openCreateOpeningClosureDialog}
              >
                <CalendarX className="h-4 w-4" aria-hidden="true" />
                Déclarer une fermeture
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={openCreateResourceUnavailableDialog}
              >
                <Ban className="h-4 w-4" aria-hidden="true" />
                Immobiliser une ressource
              </Button>
            </>
          )}
          {canShowCreateReservationAction && (
            <Button type="button" onClick={openCreateReservationDialog}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Prendre une réservation
            </Button>
          )}
        </div>
      )}

      {calendarError && <p className="text-destructive">{calendarError}</p>}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={headerToolbar}
        events={fetchReservations}
        height={height}
        titleFormat={titleFormat}
        eventClick={onEventClick}
        eventContent={renderEventContent}
        eventDidMount={onEventDidMount}
        displayEventTime={true}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
        }}
      />

      <ReservationDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        reservation={selectedReservation}
        loading={detailsLoading}
        error={detailsError}
        mode={mode}
        onReservationCancelled={handleReservationCancelled}
      />

      <CreateReservationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialDate={createDate}
        adminUsers={reservationUser ? [reservationUser] : adminUsers}
        initialUser={reservationUser}
        onReservationCreated={handleReservationCreated}
      />

      <CreateOpeningClosureDialog
        open={closureOpen}
        onOpenChange={(open) => {
          setClosureOpen(open);
          if (!open) setSelectedOpeningClosure(null);
        }}
        selectedClosure={selectedOpeningClosure}
        onClosureCreated={handleClosureCreated}
        onClosureUpdated={handleClosureUpdated}
      />

      <CreateResourceUnavailableDialog
        open={resourceUnavailableOpen}
        onOpenChange={(open) => {
          setResourceUnavailableOpen(open);
          if (!open) setSelectedResourceUnavailable(null);
        }}
        selectedPeriod={selectedResourceUnavailable}
        onResourceUnavailableCreated={handleResourceUnavailableCreated}
        onResourceUnavailableUpdated={handleResourceUnavailableUpdated}
      />
    </div>
  );
}

function renderEventContent(info: EventContentArg) {
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden text-xs leading-tight">
      {info.timeText && (
        <span className="shrink-0 font-semibold tabular-nums">
          {info.timeText}
        </span>
      )}
      <span className="min-w-0 truncate">{info.event.title}</span>
    </div>
  );
}

function toCalendarEvent(
  reservation: TCalendarReservation,
  mode: TReservationsCalendarMode,
): EventInput {
  const [primaryColor] = reservation.resourceColors;

  return {
    id: reservation.id,
    title:
      mode === 'admin' && reservation.customerName
        ? `${reservation.serviceLabel} - ${reservation.customerName}`
        : reservation.serviceLabel,
    start: reservation.start,
    end: reservation.end,
    backgroundColor: primaryColor ?? '#d97706',
    borderColor: primaryColor ?? '#d97706',
    extendedProps: {
      eventKind: 'reservation',
      resourceColors: reservation.resourceColors,
    },
  };
}

function getEventColors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is string =>
      typeof entry === 'string' && /^#[0-9a-fA-F]{6}$/.test(entry),
  );
}

function toOpeningClosureEvent(
  closure: TOpeningClosureCalendarEvent,
): EventInput {
  return {
    id: closure.id,
    title: closure.title,
    start: closure.start,
    end: closure.end,
    allDay: closure.allDay,
    backgroundColor: '#64748b',
    borderColor: '#475569',
    textColor: '#ffffff',
    extendedProps: {
      eventKind: 'openingClosure',
      openingClosure: closure,
    },
  };
}

function toResourceUnavailableEvent(
  period: TResourceUnavailableCalendarEvent,
): EventInput {
  return {
    id: period.id,
    title:
      period.quantity === null
        ? period.title
        : `${period.title} (${period.quantity})`,
    start: period.start,
    end: period.end,
    backgroundColor: period.color,
    borderColor: period.color,
    textColor: '#ffffff',
    extendedProps: {
      eventKind: 'resourceUnavailable',
      resourceUnavailablePeriod: period,
    },
  };
}

function ReservationDetailsDialog({
  open,
  onOpenChange,
  reservation,
  loading,
  error,
  mode,
  onReservationCancelled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: TReservationDetails | null;
  loading: boolean;
  error: string | null;
  mode: TReservationsCalendarMode;
  onReservationCancelled: (reservation: TReservationDetails) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la réservation</DialogTitle>
          <DialogDescription>
            Informations enregistrées pour cette réservation.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}

        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && reservation && (
          <ReservationDetails
            reservation={reservation}
            mode={mode}
            onReservationCancelled={onReservationCancelled}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateReservationDialog({
  open,
  onOpenChange,
  initialDate,
  adminUsers,
  initialUser,
  onReservationCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: string;
  adminUsers: TAdminUserListItem[];
  initialUser?: TAdminUserListItem;
  onReservationCreated: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
          <DialogDescription>
            Enregistrer une réservation pour un client. Si le client a déjà un
            compte, utilisez son e-mail pour pré-remplir les informations. Il
            recevra une notification de sa réservation dans son espace personnel
            et par e-mail si il a accepté de recevoir des emails liés à ses
            réservations.
          </DialogDescription>
        </DialogHeader>

        <CreateAdminReservationForm
          key={`${initialDate}-${initialUser?.id ?? 'new-client'}`}
          initialDate={initialDate}
          adminUsers={adminUsers}
          initialUser={initialUser}
          onSuccess={onReservationCreated}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateOpeningClosureDialog({
  open,
  onOpenChange,
  selectedClosure,
  onClosureCreated,
  onClosureUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClosure: TOpeningClosureCalendarEvent | null;
  onClosureCreated: () => void;
  onClosureUpdated: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {selectedClosure
              ? 'Détail de la fermeture'
              : 'Déclarer une fermeture'}
          </DialogTitle>
          <DialogDescription>
            {selectedClosure
              ? 'Modifier ou supprimer cette période.'
              : 'Bloquer les réservations sur une période de fermeture.'}
          </DialogDescription>
        </DialogHeader>

        {selectedClosure ? (
          <UpdateOpeningClosureForm
            key={selectedClosure.id}
            values={selectedClosure}
            onSuccess={onClosureUpdated}
            onDeleted={onClosureUpdated}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <CreateOpeningClosureForm
            onSuccess={onClosureCreated}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateResourceUnavailableDialog({
  open,
  onOpenChange,
  selectedPeriod,
  onResourceUnavailableCreated,
  onResourceUnavailableUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPeriod: TResourceUnavailableCalendarEvent | null;
  onResourceUnavailableCreated: () => void;
  onResourceUnavailableUpdated: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {selectedPeriod
              ? "Détail de l'immobilisation"
              : 'Immobiliser une ressource'}
          </DialogTitle>
          <DialogDescription>
            {selectedPeriod
              ? 'Modifier ou supprimer cette période.'
              : 'Bloquer une ressource sur une période donnée.'}
          </DialogDescription>
        </DialogHeader>

        {selectedPeriod ? (
          <UpdateResourceUnavailablePeriodForm
            key={selectedPeriod.periodId}
            values={selectedPeriod}
            onSuccess={onResourceUnavailableUpdated}
            onDeleted={onResourceUnavailableUpdated}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <CreateResourceUnavailablePeriodForm
            onSuccess={onResourceUnavailableCreated}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReservationDetails({
  reservation,
  mode,
  onReservationCancelled,
}: {
  reservation: TReservationDetails;
  mode: TReservationsCalendarMode;
  onReservationCancelled: (reservation: TReservationDetails) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2 rounded-lg border bg-background/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Prestation
            </p>
            <p className="text-lg font-semibold text-primary">
              {reservation.serviceLabel}
            </p>
          </div>
          <Badge variant="secondary">
            {getStatusLabel(reservation.status)}
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Début"
            value={formatDateTime(reservation.startsAt)}
          />
          <DetailItem
            label="Créneau ressource"
            value={`${formatDateTime(reservation.start)} - ${formatTime(
              reservation.end,
            )}`}
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Client" value={reservation.customerName ?? '-'} />
        <DetailItem label="Téléphone" value={reservation.customerPhone} />
        <DetailItem label="E-mail" value={reservation.customerEmail ?? '-'} />
        <DetailItem
          label="Réservation faite par"
          value={formatBookedBy(reservation)}
        />
        <DetailItem
          label="Créée le"
          value={formatDateTime(reservation.createdAt)}
        />
      </section>

      {mode === 'admin' && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-primary">
            Ressources mobilisées
          </h3>
          <div className="grid gap-2">
            {reservation.resources.map((resource) => (
              <div
                key={`${resource.ressourceId}-${resource.startAt}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: resource.color }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold">{resource.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantité : {resource.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(resource.startAt)} -{' '}
                  {formatTime(resource.endAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {reservation.notes && (
        <DetailItem label="Notes" value={reservation.notes} />
      )}

      {canCancelReservation(reservation) && (
        <CancelReservationForm
          reservationId={reservation.id}
          mode={mode}
          onSuccess={onReservationCancelled}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/70 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium">{value}</p>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getStatusLabel(status: TReservationDetails['status']): string {
  const labels: Record<TReservationDetails['status'], string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    CANCELLED: 'Annulée',
    COMPLETED: 'Terminée',
    NO_SHOW: 'Absence',
  };

  return labels[status];
}

function formatBookedBy(reservation: TReservationDetails): string {
  const name = reservation.bookedByName ?? reservation.bookedBy;
  const role = getBookedByRoleLabel(reservation.bookedByRole);

  if (!name) return '-';
  if (!role) return name;
  return `${name} (${role})`;
}

function getBookedByRoleLabel(
  role: TReservationDetails['bookedByRole'],
): string | null {
  if (role === 'ADMIN') return 'admin';
  if (role === 'STAFF') return 'staff';
  if (role === 'USER') return 'client';
  return null;
}

function canCancelReservation(reservation: TReservationDetails): boolean {
  return (
    ['PENDING', 'CONFIRMED'].includes(reservation.status) &&
    isTodayOrFutureReservationDate(new Date(reservation.startsAt))
  );
}
