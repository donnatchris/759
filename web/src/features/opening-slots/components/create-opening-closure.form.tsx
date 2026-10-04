'use client';

import { notifyCalendarEventsChanged } from '@/features/events/lib/events-calendar-refresh';

import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarX, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { createOpeningClosureAction } from '../lib/opening-slots.action';
import {
  createOpeningClosureSchema,
  type TCreateOpeningClosureInput,
  type TCreateOpeningClosureOutput,
} from '../lib/opening-slots.schema';
import { formatDateInputValue } from '../lib/opening-slots.types';

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateOpeningClosureForm({ onSuccess, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const today = useMemo(() => formatDateInputValue(new Date()), []);
  const defaultValues: TCreateOpeningClosureInput = {
    startDate: today,
    endDate: today,
    label: '',
  };

  const form = useForm<
    TCreateOpeningClosureInput,
    unknown,
    TCreateOpeningClosureOutput
  >({
    resolver: zodResolver(createOpeningClosureSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = form;

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
    setSuccessMessage(null);
  };

  const onSubmit = async (data: TCreateOpeningClosureOutput) => {
    try {
      setServerError(null);
      setSuccessMessage(null);

      const response = await createOpeningClosureAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      reset(defaultValues);
      setSuccessMessage('La période de fermeture a bien été enregistrée.');
      notifyCalendarEventsChanged();
      onSuccess?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="opening-closure-start-date">
              Date de début <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opening-closure-start-date"
              type="date"
              className="rounded-xl"
              {...register('startDate')}
            />
            {errors.startDate?.message && (
              <p className="text-sm text-destructive">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="opening-closure-end-date">
              Date de fin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="opening-closure-end-date"
              type="date"
              className="rounded-xl"
              {...register('endDate')}
            />
            {errors.endDate?.message && (
              <p className="text-sm text-destructive">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <RHFInput<TCreateOpeningClosureInput>
          name="label"
          label="Libellé"
          placeholder="Fermeture exceptionnelle"
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

        {successMessage && (
          <p className="flex items-center gap-2 text-sm text-primary">
            <CalendarX className="h-4 w-4" aria-hidden="true" />
            {successMessage}
          </p>
        )}
        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
