'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import type { TAdminUserListItem } from '@/features/auth/auth.types';
import {
  createAdminReservationAction,
  getReservableServiceOptionsAction,
  getReservationWeekAvailabilityAction,
} from '../lib/reservations.action';
import {
  createAdminReservationSchema,
  type TCreateAdminReservationInput,
  type TCreateAdminReservationOutput,
} from '../lib/reservations.schema';
import {
  addDays,
  createLocalDateTime,
  formatDateInputValue,
  type TReservableServiceOption,
  type TReservationWeekAvailability,
} from '../lib/reservations.types';

const adminReservationFormSchema = createAdminReservationSchema.extend({
  date: z.iso.date({ error: 'La date est obligatoire' }),
});

type TAdminReservationFormInput = TCreateAdminReservationInput & {
  date: string;
};

type TAdminReservationFormOutput = TCreateAdminReservationOutput & {
  date: string;
};

type Props = {
  initialDate: string;
  adminUsers?: TAdminUserListItem[];
  initialUser?: TAdminUserListItem;
  onSuccess?: () => void;
};

export function CreateAdminReservationForm({
  initialDate,
  adminUsers = [],
  initialUser,
  onSuccess,
}: Props) {
  const [serviceOptions, setServiceOptions] = useState<
    TReservableServiceOption[]
  >([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [weekAvailability, setWeekAvailability] =
    useState<TReservationWeekAvailability | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMissingEmailConfirmation, setShowMissingEmailConfirmation] =
    useState(false);

  const today = useMemo(() => formatDateInputValue(new Date()), []);
  const defaultValues = useMemo<TAdminReservationFormInput>(
    () => ({
      serviceId: '',
      date: initialDate || today,
      startsAt: '',
      customerName: initialUser?.name ?? '',
      customerEmail: initialUser?.email ?? '',
      customerPhone: initialUser?.phone ?? '',
    }),
    [initialDate, initialUser, today],
  );

  const form = useForm<
    TAdminReservationFormInput,
    unknown,
    TAdminReservationFormOutput
  >({
    resolver: zodResolver(adminReservationFormSchema),
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
  const selectedServiceId = useWatch({
    control: form.control,
    name: 'serviceId',
  });
  const selectedStartsAt = useWatch({
    control: form.control,
    name: 'startsAt',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchServices() {
      setServicesLoading(true);
      setServerError(null);

      const response = await getReservableServiceOptionsAction();

      if (!isMounted) return;

      if (response.success) {
        setServiceOptions(response.data);
      } else {
        setServerError(getErrorMessageFromResponse(response));
      }

      setServicesLoading(false);
    }

    fetchServices().catch(() => {
      if (!isMounted) return;
      setServicesLoading(false);
      setServerError('Impossible de charger les prestations réservables.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchAvailability() {
      if (!selectedDate || !selectedServiceId) {
        return;
      }

      setSlotsLoading(true);
      setServerError(null);

      const response = await getReservationWeekAvailabilityAction({
        serviceId: selectedServiceId,
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
  }, [clearErrors, selectedDate, selectedServiceId, setValue]);

  const resetAll = () => {
    reset(defaultValues);
    setWeekAvailability(null);
    setServerError(null);
    setSuccessMessage(null);
    setShowMissingEmailConfirmation(false);
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
  const totalSlots =
    weekAvailability?.days.reduce((sum, day) => sum + day.slots.length, 0) ?? 0;
  const selectOptions = serviceOptions.map((service) => ({
    value: service.id,
    label: `${service.categoryLabel} - ${service.label}`,
  }));

  const submitReservation = async (data: TAdminReservationFormOutput) => {
    try {
      setIsSaving(true);
      setShowMissingEmailConfirmation(false);
      setServerError(null);
      setSuccessMessage(null);

      const response = await createAdminReservationAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      reset(defaultValues);
      setSuccessMessage('La réservation a bien été enregistrée.');
      onSuccess?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: TAdminReservationFormOutput) => {
    if (!data.customerEmail) {
      setShowMissingEmailConfirmation(true);
      return;
    }

    setShowMissingEmailConfirmation(false);
    await submitReservation(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...form.register('date')} />
        <input type="hidden" {...form.register('startsAt')} />

        <div className="grid gap-3 sm:grid-cols-2">
          <RHFInput<TAdminReservationFormInput>
            name="serviceId"
            label="Prestation"
            type="select"
            required
            placeholder={
              servicesLoading ? 'Chargement...' : 'Choisir une prestation'
            }
            selectOptions={selectOptions}
          />
          <RHFInput<TAdminReservationFormInput>
            name="customerName"
            label="Nom du client"
            placeholder="Nom"
          />
          <AdminReservationEmailInput
            users={adminUsers}
            onUserSelected={(selectedUser) => {
              setValue('customerName', selectedUser.name, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('customerPhone', selectedUser.phone ?? '', {
                shouldDirty: true,
                shouldValidate: true,
              });
              clearErrors(['customerName', 'customerPhone']);
            }}
          />
          <RHFInput<TAdminReservationFormInput>
            name="customerPhone"
            label="Téléphone"
            type="tel"
            required
            placeholder="06..."
          />
        </div>

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

          {!selectedServiceId && (
            <p className="rounded-lg border bg-background/70 p-3 text-sm text-muted-foreground">
              Choisissez une prestation pour afficher les créneaux disponibles.
            </p>
          )}

          {selectedServiceId && (
            <div className="overflow-x-auto rounded-xl border border-primary/20 bg-background/70">
              <div className="grid min-w-[616px] grid-cols-7">
                {weekAvailability?.days.map((day) => (
                  <div
                    key={day.date}
                    className="border-r border-border/70 last:border-r-0"
                  >
                    <div className="sticky top-0 border-b border-border/70 bg-primary/10 px-1.5 py-2 text-center">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        {day.dayLabel}
                      </p>
                      <p className="text-xl font-semibold text-primary">
                        {day.dayNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.monthLabel}
                      </p>
                    </div>

                    <div className="flex min-h-44 flex-col gap-1.5 p-1.5">
                      {slotsLoading ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          Chargement...
                        </p>
                      ) : day.slots.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                          Complet
                        </p>
                      ) : (
                        day.slots.map((slot) => {
                          const isSelected = selectedStartsAt === slot.startsAt;

                          return (
                            <Button
                              key={slot.startsAt}
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setValue('startsAt', slot.startsAt, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                                clearErrors('startsAt');
                              }}
                              className="h-8 rounded-full px-2 text-xs"
                            >
                              {slot.label}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedServiceId && !slotsLoading && totalSlots === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun créneau disponible sur cette semaine.
            </p>
          )}
          {errors.startsAt?.message && (
            <p className="text-destructive">{errors.startsAt.message}</p>
          )}
        </div>

        {showMissingEmailConfirmation && (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <TriangleAlert
                className="mt-0.5 size-5 shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <div className="space-y-2">
                <p className="font-semibold">Réservation sans adresse e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Aucune adresse e-mail n’est renseignée. Aucun e-mail de
                  confirmation ne sera envoyé au client et il ne sera pas
                  possible de vérifier automatiquement si celui-ci dispose déjà
                  d’un compte. Voulez-vous poursuivre malgré tout ?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMissingEmailConfirmation(false)}
                    disabled={isSaving}
                  >
                    Revenir au formulaire
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      void handleSubmit(submitReservation)();
                    }}
                    disabled={isSaving}
                  >
                    Poursuivre
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isSaving ||
              showMissingEmailConfirmation ||
              servicesLoading ||
              slotsLoading ||
              !selectedServiceId ||
              !selectedStartsAt
            }
            className="rounded-xl"
          >
            <Send size={16} className="mr-1 inline-block" />
            {isSubmitting || isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting || isSaving}
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
      </form>
    </FormProvider>
  );
}

function AdminReservationEmailInput({
  users,
  onUserSelected,
}: {
  users: TAdminUserListItem[];
  onUserSelected: (user: TAdminUserListItem) => void;
}) {
  const {
    register,
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<TAdminReservationFormInput>();
  const email = useWatch({ control, name: 'customerEmail' }) ?? '';
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedEmail, setDebouncedEmail] = useState(email);
  const lastAutoFilledEmail = useRef<string | null>(null);
  const emailRegistration = register('customerEmail');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedEmail(email);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [email]);

  const normalizedDebouncedEmail = normalizeEmail(debouncedEmail);
  const matchingUsers = useMemo(() => {
    if (normalizedDebouncedEmail.length < 2) return [];

    return users
      .filter((user) =>
        normalizeEmail(user.email).includes(normalizedDebouncedEmail),
      )
      .slice(0, 6);
  }, [normalizedDebouncedEmail, users]);
  const exactUser = useMemo(
    () =>
      users.find(
        (user) => normalizeEmail(user.email) === normalizedDebouncedEmail,
      ) ?? null,
    [normalizedDebouncedEmail, users],
  );
  const shouldShowSuggestions =
    isFocused && matchingUsers.length > 0 && !exactUser;

  useEffect(() => {
    if (!exactUser) {
      lastAutoFilledEmail.current = null;
      return;
    }

    const normalizedEmail = normalizeEmail(exactUser.email);
    if (lastAutoFilledEmail.current === normalizedEmail) return;

    lastAutoFilledEmail.current = normalizedEmail;
    onUserSelected(exactUser);
  }, [exactUser, onUserSelected]);

  const selectUser = (user: TAdminUserListItem) => {
    lastAutoFilledEmail.current = normalizeEmail(user.email);
    setValue('customerEmail', user.email, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors('customerEmail');
    onUserSelected(user);
    setIsFocused(false);
  };

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="customerEmail" className="font-bold">
          E-mail <span className="text-muted-foreground">(optionnel)</span>
        </Label>
        {exactUser && (
          <Badge variant="secondary" className="rounded-lg">
            Compte enregistré
          </Badge>
        )}
      </div>
      <Input
        id="customerEmail"
        type="email"
        placeholder="client@example.com"
        autoComplete="off"
        className="rounded-xl"
        {...emailRegistration}
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          emailRegistration.onBlur(event);
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        onChange={(event) => {
          lastAutoFilledEmail.current = null;
          emailRegistration.onChange(event);
        }}
      />

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md">
          {matchingUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectUser(user)}
            >
              <span className="font-medium">{user.email}</span>
              <span className="text-xs text-muted-foreground">
                {user.name}
                {user.phone ? ` · ${user.phone}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {errors.customerEmail?.message && (
        <p className="text-destructive">{errors.customerEmail.message}</p>
      )}
    </div>
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
