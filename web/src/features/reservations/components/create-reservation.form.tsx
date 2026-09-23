'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { useUser } from '@/features/auth/auth.context';
import {
  createReservationAction,
  getReservationWeekAvailabilityAction,
} from '../lib/reservations.action';
import {
  createReservationSchema,
  type TCreateReservationInput,
  type TCreateReservationOutput,
} from '../lib/reservations.schema';
import {
  addDays,
  createLocalDateTime,
  formatDateInputValue,
  type TReservationDayAvailability,
  type TReservationSlot,
  type TReservationWeekAvailability,
} from '../lib/reservations.types';

const reservationFormSchema = createReservationSchema.extend({
  date: z.iso.date({ error: 'La date est obligatoire' }),
});

type TReservationFormInput = TCreateReservationInput & {
  date: string;
};

type TReservationFormOutput = TCreateReservationOutput & {
  date: string;
};

type Props = {
  serviceId: string;
  serviceLabel: string;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateReservationForm({
  serviceId,
  serviceLabel,
  onSuccess,
  onClose,
}: Props) {
  const { user } = useUser();
  const [weekAvailability, setWeekAvailability] =
    useState<TReservationWeekAvailability | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requiresLegalTermsAcceptance, setRequiresLegalTermsAcceptance] =
    useState(false);

  const today = useMemo(() => formatDateInputValue(new Date()), []);
  const defaultValues: TReservationFormInput = {
    serviceId,
    date: today,
    startsAt: '',
  };

  const form = useForm<TReservationFormInput, unknown, TReservationFormOutput>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    clearErrors,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const selectedDate = useWatch({
    control: form.control,
    name: 'date',
  });
  const selectedStartsAt = useWatch({
    control: form.control,
    name: 'startsAt',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchAvailability() {
      if (!selectedDate) return;

      setSlotsLoading(true);
      setServerError(null);

      const response = await getReservationWeekAvailabilityAction({
        serviceId,
        weekStartDate: selectedDate,
      });

      if (!isMounted) return;

      if (response.success) {
        setWeekAvailability(response.data);
        setValue('startsAt', '', { shouldValidate: false });
        clearErrors('startsAt');
      } else {
        setWeekAvailability(null);
        setServerError(getErrorMessageFromResponse(response));
      }

      setSlotsLoading(false);
    }

    fetchAvailability().catch(() => {
      if (!isMounted) return;
      setWeekAvailability(null);
      setSlotsLoading(false);
      setServerError('Impossible de charger les créneaux disponibles.');
    });

    return () => {
      isMounted = false;
    };
  }, [clearErrors, selectedDate, serviceId, setValue]);

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
    setRequiresLegalTermsAcceptance(false);
    setSuccessMessage(null);
  };

  const goToPreviousWeek = () => {
    const previousWeekStart = formatDateInputValue(
      addDays(createLocalDateTime(selectedDate, 0), -7),
    );
    const minDate = weekAvailability?.minDate ?? today;

    setValue('date', previousWeekStart < minDate ? minDate : previousWeekStart);
  };

  const goToNextWeek = () => {
    const nextWeekStart = formatDateInputValue(
      addDays(createLocalDateTime(selectedDate, 0), 7),
    );
    const maxDate = weekAvailability?.maxDate;

    if (maxDate && nextWeekStart > maxDate) return;
    setValue('date', nextWeekStart);
  };

  const canGoPrevious =
    Boolean(weekAvailability) &&
    selectedDate > (weekAvailability?.minDate ?? today);
  const canGoNext =
    Boolean(weekAvailability) &&
    (!weekAvailability?.maxDate ||
      formatDateInputValue(addDays(createLocalDateTime(selectedDate, 0), 7)) <=
        weekAvailability.maxDate);
  const userCannotBook = user ? !user.canBook : false;
  const totalSlots =
    weekAvailability?.days.reduce((sum, day) => sum + day.slots.length, 0) ?? 0;

  const onSubmit = async (data: TReservationFormOutput) => {
    try {
      setServerError(null);
      setRequiresLegalTermsAcceptance(false);
      setSuccessMessage(null);

      const response = await createReservationAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        setRequiresLegalTermsAcceptance(
          response.error === ERROR_CODES.LEGAL_TERMS_ACCEPTANCE_REQUIRED,
        );
        return;
      }

      reset(defaultValues);
      setSuccessMessage('Votre demande de réservation a bien été enregistrée.');
      onSuccess?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">Prestation</p>
          <p className="font-semibold text-primary">{serviceLabel}</p>
        </div>

        <p className="mb-3 text-sm font-medium text-primary">
          Nous vous rappelons que nos prestations sont exclusivement réservées
          aux femmes et aux enfants.
        </p>

        <input type="hidden" {...form.register('serviceId')} />

        <input type="hidden" {...form.register('date')} />
        <input type="hidden" {...form.register('startsAt')} />

        {user && (
          <div className="grid gap-2 rounded-lg border border-primary/20 bg-background/70 p-4 text-sm sm:grid-cols-3">
            <ContactItem label="Nom" value={user.name} />
            <ContactItem label="Téléphone" value={user.phone ?? '-'} />
            <ContactItem label="E-mail" value={user.email} />
          </div>
        )}

        {userCannotBook && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Votre compte n&apos;est pas autorisé à prendre des réservations.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              slotsLoading ||
              !selectedStartsAt ||
              userCannotBook
            }
            className="rounded-xl"
          >
            <Send size={16} className="mr-1 inline-block" />
            {isSubmitting ? 'Réservation...' : 'Réserver'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            <RotateCcw size={16} className="mr-1 inline-block" />
            Réinitialiser
          </Button>
        </div>

        {successMessage && (
          <p className="flex items-center gap-2 text-sm text-primary">
            <CalendarCheck className="h-4 w-4" />
            {successMessage}
          </p>
        )}
        {serverError && <p className="text-destructive">{serverError}</p>}
        {requiresLegalTermsAcceptance && (
          <Button asChild variant="outline" className="w-fit">
            <Link href="/auth/redirect">Consulter et accepter les CGU</Link>
          </Button>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="font-bold">
              Créneau <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goToPreviousWeek}
                disabled={!canGoPrevious || slotsLoading}
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={goToNextWeek}
                disabled={!canGoNext || slotsLoading}
                aria-label="Semaine suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:hidden">
            {weekAvailability?.days.map((day) => (
              <MobileAvailabilityDay
                key={day.date}
                day={day}
                slotsLoading={slotsLoading}
                selectedStartsAt={selectedStartsAt}
                onSelectSlot={(slot) => {
                  setValue('startsAt', slot.startsAt, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  clearErrors('startsAt');
                }}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-primary/20 bg-background/70 sm:block">
            <div className="grid min-w-[616px] grid-cols-7">
              {weekAvailability?.days.map((day) => (
                <DesktopAvailabilityDay
                  key={day.date}
                  day={day}
                  slotsLoading={slotsLoading}
                  selectedStartsAt={selectedStartsAt}
                  onSelectSlot={(slot) => {
                    setValue('startsAt', slot.startsAt, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    clearErrors('startsAt');
                  }}
                />
              ))}
            </div>
          </div>

          {!slotsLoading && totalSlots === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun créneau disponible sur cette semaine.
            </p>
          )}
          {errors.startsAt?.message && (
            <p className="text-destructive">{errors.startsAt.message}</p>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

function MobileAvailabilityDay({
  day,
  slotsLoading,
  selectedStartsAt,
  onSelectSlot,
}: {
  day: TReservationDayAvailability;
  slotsLoading: boolean;
  selectedStartsAt: string;
  onSelectSlot: (slot: TReservationSlot) => void;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-background/70">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-primary/10 px-3 py-2">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {day.dayLabel}
          </p>
          <p className="text-sm text-muted-foreground">{day.monthLabel}</p>
        </div>
        <p className="text-2xl font-semibold text-primary">{day.dayNumber}</p>
      </div>

      <div className="grid min-h-16 grid-cols-2 gap-2 p-3">
        <AvailabilitySlots
          day={day}
          slotsLoading={slotsLoading}
          selectedStartsAt={selectedStartsAt}
          onSelectSlot={onSelectSlot}
          emptyClassName="col-span-2 py-3"
          buttonClassName="h-9 w-full rounded-full px-2 text-xs"
        />
      </div>
    </div>
  );
}

function DesktopAvailabilityDay({
  day,
  slotsLoading,
  selectedStartsAt,
  onSelectSlot,
}: {
  day: TReservationDayAvailability;
  slotsLoading: boolean;
  selectedStartsAt: string;
  onSelectSlot: (slot: TReservationSlot) => void;
}) {
  return (
    <div className="border-r border-border/70 last:border-r-0">
      <div className="sticky top-0 border-b border-border/70 bg-primary/10 px-1.5 py-2 text-center">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {day.dayLabel}
        </p>
        <p className="text-xl font-semibold text-primary">{day.dayNumber}</p>
        <p className="text-xs text-muted-foreground">{day.monthLabel}</p>
      </div>

      <div className="flex min-h-44 flex-col gap-1.5 p-1.5">
        <AvailabilitySlots
          day={day}
          slotsLoading={slotsLoading}
          selectedStartsAt={selectedStartsAt}
          onSelectSlot={onSelectSlot}
          emptyClassName="py-6"
          buttonClassName="h-8 rounded-full px-2 text-xs"
        />
      </div>
    </div>
  );
}

function AvailabilitySlots({
  day,
  slotsLoading,
  selectedStartsAt,
  onSelectSlot,
  emptyClassName,
  buttonClassName,
}: {
  day: TReservationDayAvailability;
  slotsLoading: boolean;
  selectedStartsAt: string;
  onSelectSlot: (slot: TReservationSlot) => void;
  emptyClassName: string;
  buttonClassName: string;
}) {
  if (slotsLoading) {
    return (
      <p
        className={`${emptyClassName} text-center text-xs text-muted-foreground`}
      >
        Chargement...
      </p>
    );
  }

  if (day.slots.length === 0) {
    return (
      <p
        className={`${emptyClassName} text-center text-xs text-muted-foreground`}
      >
        Aucun créneau
      </p>
    );
  }

  return day.slots.map((slot) => {
    const isSelected = selectedStartsAt === slot.startsAt;

    return (
      <Button
        key={slot.startsAt}
        type="button"
        variant={isSelected ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelectSlot(slot)}
        className={buttonClassName}
      >
        {slot.label}
      </Button>
    );
  });
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
