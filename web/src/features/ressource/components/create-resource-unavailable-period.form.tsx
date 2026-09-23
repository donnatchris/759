'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  createResourceUnavailablePeriodAction,
  getRessourcesAction,
} from '../lib/ressource.action';
import {
  createResourceUnavailablePeriodSchema,
  type TCreateResourceUnavailablePeriodInput,
  type TCreateResourceUnavailablePeriodOutput,
} from '../lib/ressource.schema';
import { formatDateInputValue } from '@/features/reservations/lib/reservations.types';
import type { Ressource } from '../lib/ressource.types';

type Props = {
  onSuccess?: () => void;
  onClose?: () => void;
};

export function CreateResourceUnavailablePeriodForm({
  onSuccess,
  onClose,
}: Props) {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [ressourcesLoading, setRessourcesLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const today = useMemo(() => formatDateInputValue(new Date()), []);
  const defaultValues: TCreateResourceUnavailablePeriodInput = {
    ressourceId: '',
    startDate: today,
    startTime: '09:00',
    endDate: today,
    endTime: '18:00',
    quantity: '',
    reason: '',
  };

  const form = useForm<
    TCreateResourceUnavailablePeriodInput,
    unknown,
    TCreateResourceUnavailablePeriodOutput
  >({
    resolver: zodResolver(createResourceUnavailablePeriodSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    let isMounted = true;

    async function fetchRessources() {
      setRessourcesLoading(true);
      setServerError(null);

      const response = await getRessourcesAction();

      if (!isMounted) return;

      if (response.success) {
        setRessources(response.data);
      } else {
        setServerError(getErrorMessageFromResponse(response));
      }

      setRessourcesLoading(false);
    }

    fetchRessources().catch(() => {
      if (!isMounted) return;
      setRessourcesLoading(false);
      setServerError('Impossible de charger les ressources.');
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
    setSuccessMessage(null);
  };

  const onSubmit = async (data: TCreateResourceUnavailablePeriodOutput) => {
    try {
      setServerError(null);
      setSuccessMessage(null);

      const response = await createResourceUnavailablePeriodAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      reset(defaultValues);
      setSuccessMessage("L'immobilisation a bien été enregistrée.");
      onSuccess?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  const ressourceOptions = ressources.map((ressource) => ({
    value: ressource.id,
    label: `${ressource.label} (${ressource.quantity} disponible${
      ressource.quantity > 1 ? 's' : ''
    })`,
  }));

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <RHFInput<TCreateResourceUnavailablePeriodInput>
          name="ressourceId"
          label="Ressource"
          type="select"
          required
          placeholder={
            ressourcesLoading ? 'Chargement...' : 'Choisir une ressource'
          }
          selectOptions={ressourceOptions}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="resource-unavailable-start-date">
              Date de début <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource-unavailable-start-date"
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

          <RHFInput<TCreateResourceUnavailablePeriodInput>
            name="startTime"
            label="Heure de début"
            type="time"
            required
          />

          <div className="grid gap-2">
            <Label htmlFor="resource-unavailable-end-date">
              Date de fin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource-unavailable-end-date"
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

          <RHFInput<TCreateResourceUnavailablePeriodInput>
            name="endTime"
            label="Heure de fin"
            type="time"
            required
          />
        </div>

        <RHFInput<TCreateResourceUnavailablePeriodInput>
          name="quantity"
          label="Quantité immobilisée"
          type="number"
          placeholder="Toute la ressource"
          popoverContent="Laissez vide pour immobiliser toute la ressource."
        />

        <RHFInput<TCreateResourceUnavailablePeriodInput>
          name="reason"
          label="Motif"
          type="textarea"
          placeholder="Absence, maintenance, indisponibilité..."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || ressourcesLoading}
            className="rounded-xl"
          >
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
            <Ban className="h-4 w-4" aria-hidden="true" />
            {successMessage}
          </p>
        )}
        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}
