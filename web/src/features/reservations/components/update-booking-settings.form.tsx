'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { updateBookingSettingsAction } from '../lib/reservations.action';
import {
  updateBookingSettingsSchema,
  type TUpdateBookingSettingsInput,
  type TUpdateBookingSettingsOutput,
} from '../lib/reservations.schema';
import type { BookingSettings } from '../lib/reservations.types';

type Props = {
  values: BookingSettings;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateBookingSettingsForm({
  values,
  onSuccess,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultValues: TUpdateBookingSettingsInput = {
    enabled: values.enabled,
    onlineBookingEnabled: values.onlineBookingEnabled,
    slotStepMinutes: values.slotStepMinutes,
    minNoticeHours: values.minNoticeHours,
    maxAdvanceDays: values.maxAdvanceDays,
  };

  const form = useForm<
    TUpdateBookingSettingsInput,
    unknown,
    TUpdateBookingSettingsOutput
  >({
    resolver: zodResolver(updateBookingSettingsSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = async (data: TUpdateBookingSettingsOutput) => {
    try {
      setServerError(null);

      const response = await updateBookingSettingsAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      reset(data);
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
        <div className="grid gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <input
              id="booking-settings-enabled"
              type="checkbox"
              {...form.register('enabled')}
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor="booking-settings-enabled" className="font-medium">
              Réservations activées
            </Label>
          </div>
          {errors.enabled?.message && (
            <p className="text-sm text-destructive">{errors.enabled.message}</p>
          )}
        </div>

        <div className="grid gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-3">
            <input
              id="booking-settings-online-enabled"
              type="checkbox"
              {...form.register('onlineBookingEnabled')}
              aria-invalid={Boolean(errors.onlineBookingEnabled)}
              className="h-4 w-4 accent-primary"
            />
            <Label
              htmlFor="booking-settings-online-enabled"
              className="font-medium"
            >
              Réservation en ligne par les clients activée
            </Label>
          </div>
          {errors.onlineBookingEnabled?.message && (
            <p className="text-sm text-destructive">
              {errors.onlineBookingEnabled.message}
            </p>
          )}
        </div>

        <RHFInput<TUpdateBookingSettingsInput>
          name="slotStepMinutes"
          label="Pas des créneaux (minutes)"
          type="number"
          required
          popoverContent="Intervalle utilisé pour proposer les créneaux disponibles."
        />

        <RHFInput<TUpdateBookingSettingsInput>
          name="minNoticeHours"
          label="Délai minimum avant réservation (heures)"
          type="number"
          required
          popoverContent="Nombre d'heures minimum entre maintenant et le début d'une réservation."
        />

        <RHFInput<TUpdateBookingSettingsInput>
          name="maxAdvanceDays"
          label="Réservation maximum à l'avance (jours)"
          type="number"
          required
          popoverContent="Nombre de jours maximum pendant lesquels les clients peuvent réserver à l'avance."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting} className="rounded-xl">
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réinitialiser
          </Button>
        </div>

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
