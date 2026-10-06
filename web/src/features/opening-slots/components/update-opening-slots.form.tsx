'use client';

import { useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { RotateCcw, Save } from 'lucide-react';
import {
  updateOpeningSlotsSchema,
  type TUpdateOpeningSlotsInput,
  type TUpdateOpeningSlotsOutput,
} from '../lib/opening-slots.schema';
import {
  getOpeningSlotFormRows,
  OPENING_SLOT_DAY_LABELS,
  type OpeningSlot,
} from '../lib/opening-slots.types';
import { updateAllOpeningSlotsAction } from '../lib/opening-slots.action';
import { notifyCalendarEventsChanged } from '@/features/events/lib/events-calendar-refresh';

type Props = {
  values?: OpeningSlot[];
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateOpeningSlotsForm({ values, onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const clearServerError = () => setServerError(null);

  const defaultValues = useMemo<TUpdateOpeningSlotsInput>(
    () => ({
      slots: getOpeningSlotFormRows(values ?? []),
    }),
    [values],
  );

  const form = useForm<
    TUpdateOpeningSlotsInput,
    unknown,
    TUpdateOpeningSlotsOutput
  >({
    resolver: zodResolver(updateOpeningSlotsSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const watchedSlots = useWatch({
    control: form.control,
    name: 'slots',
  });

  const resetAll = () => {
    reset(defaultValues);
    clearServerError();
  };

  const onSubmit = async (data: TUpdateOpeningSlotsOutput) => {
    try {
      clearServerError();

      const response = await updateAllOpeningSlotsAction(data);

      if (response.success) {
        notifyCalendarEventsChanged();
        reset(defaultValues);
        onClose?.();
        onSuccess?.();
      } else {
        setServerError(getErrorMessageFromResponse(response));
      }
    } catch {
      setServerError(
        'Impossible de se connecter au serveur. Veuillez réessayer plus tard.',
      );
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-4"
      >
        <p className="text-sm text-muted-foreground">
          Ajoutez un libellé, une plage horaire ou les deux. Les heures
          d’ouverture et de fermeture doivent être renseignées ensemble. Un
          libellé seul ne crée pas de disponibilité pour les réservations.
        </p>
        {OPENING_SLOT_DAY_LABELS.map((label, index) => {
          const daySlots = watchedSlots?.[index]?.slots ?? [];
          const isDayEmpty = !daySlots.some(
            (slot) =>
              slot?.isOpen &&
              (slot.label?.trim() || (slot.opensAt && slot.closesAt)),
          );

          return (
            <div
              key={label}
              className="flex flex-col gap-3 rounded-lg border border-border p-4"
            >
              <input
                type="hidden"
                {...form.register(`slots.${index}.dayOfWeek`)}
              />

              <p className="font-bold">{label}</p>

              {[0, 1].map((slotIndex) => {
                const isOpen = daySlots[slotIndex]?.isOpen;
                const inputId = `opening-slot-${index}-${slotIndex}-is-open`;

                return (
                  <div
                    key={slotIndex}
                    className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)]"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id={inputId}
                        type="checkbox"
                        {...form.register(
                          `slots.${index}.slots.${slotIndex}.isOpen`,
                        )}
                        className="h-4 w-4 accent-primary"
                      />
                      <Label htmlFor={inputId} className="font-medium">
                        Créneau {slotIndex + 1}
                      </Label>
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <RHFInput
                        name={`slots.${index}.slots.${slotIndex}.label`}
                        label="Libellé"
                        maxLength={30}
                        placeholder="Ex. : Sur réservation"
                      />
                    </div>
                    <div className="grid min-w-0 grid-cols-2 gap-3 sm:col-start-2 sm:col-span-2">
                      <RHFInput
                        name={`slots.${index}.slots.${slotIndex}.opensAt`}
                        label="Ouverture"
                        type="time"
                      />

                      <RHFInput
                        name={`slots.${index}.slots.${slotIndex}.closesAt`}
                        label="Fermeture"
                        type="time"
                        midnightAtEndOfDay
                        popoverContent="00:00 correspond à minuit en fin de journée (24h00)."
                      />
                    </div>
                    {!isOpen && (
                      <p className="text-sm text-muted-foreground sm:col-span-3">
                        Créneau désactivé.
                      </p>
                    )}
                  </div>
                );
              })}

              {isDayEmpty && (
                <p className="text-sm text-muted-foreground">
                  Aucun créneau à afficher ce jour.
                </p>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting} className="rounded-xl">
            <Save size={16} className="mr-1 inline-block" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
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

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
