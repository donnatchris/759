'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RHFInput } from '@/components/custom-ui/forms/rhf-input';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import {
  deleteResourceUnavailablePeriodAction,
  getRessourcesAction,
  updateResourceUnavailablePeriodAction,
} from '../lib/ressource.action';
import {
  updateResourceUnavailablePeriodSchema,
  type TUpdateResourceUnavailablePeriodInput,
  type TUpdateResourceUnavailablePeriodOutput,
} from '../lib/ressource.schema';
import type {
  Ressource,
  TResourceUnavailableCalendarEvent,
} from '../lib/ressource.types';

type Props = {
  values: TResourceUnavailableCalendarEvent;
  onDeleted?: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
};

export function UpdateResourceUnavailablePeriodForm({
  values,
  onDeleted,
  onSuccess,
  onClose,
}: Props) {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [ressourcesLoading, setRessourcesLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const defaultValues = useMemo<TUpdateResourceUnavailablePeriodInput>(() => {
    const start = toLocalDateTimeParts(values.start);
    const end = toLocalDateTimeParts(values.end);

    return {
      id: values.periodId,
      ressourceId: values.ressourceId,
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      quantity: values.quantity ?? '',
      reason: values.reason ?? '',
    };
  }, [values]);

  const form = useForm<
    TUpdateResourceUnavailablePeriodInput,
    unknown,
    TUpdateResourceUnavailablePeriodOutput
  >({
    resolver: zodResolver(updateResourceUnavailablePeriodSchema),
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

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const resetAll = () => {
    reset(defaultValues);
    setServerError(null);
    setDeleteConfirmOpen(false);
  };

  const onSubmit = async (data: TUpdateResourceUnavailablePeriodOutput) => {
    try {
      setServerError(null);
      setDeleteConfirmOpen(false);

      const response = await updateResourceUnavailablePeriodAction(data);

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      toast.success("L'immobilisation a bien été modifiée.", {
        position: 'top-center',
      });
      onSuccess?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    }
  };

  const deletePeriod = async () => {
    try {
      setIsDeleting(true);
      setServerError(null);

      const response = await deleteResourceUnavailablePeriodAction({
        id: values.periodId,
      });

      if (!response.success) {
        setServerError(getErrorMessageFromResponse(response));
        return;
      }

      toast.success("L'immobilisation a bien été supprimée.", {
        position: 'top-center',
      });
      onDeleted?.();
      onClose?.();
    } catch {
      setServerError('Impossible de se connecter au serveur.');
    } finally {
      setIsDeleting(false);
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
        <input type="hidden" {...register('id')} />

        <div className="grid gap-2 rounded-lg border bg-background/70 p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Ressource
          </p>
          <p className="text-base font-semibold text-primary">
            {values.resourceLabel}
          </p>
          <p className="text-sm text-muted-foreground">
            {values.quantity === null
              ? 'Toute la ressource est immobilisée.'
              : `${values.quantity} unité${
                  values.quantity > 1 ? 's' : ''
                } immobilisée${values.quantity > 1 ? 's' : ''}.`}
          </p>
        </div>

        <RHFInput<TUpdateResourceUnavailablePeriodInput>
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
            <Label htmlFor="resource-unavailable-edit-start-date">
              Date de début <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource-unavailable-edit-start-date"
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

          <RHFInput<TUpdateResourceUnavailablePeriodInput>
            name="startTime"
            label="Heure de début"
            type="time"
            required
          />

          <div className="grid gap-2">
            <Label htmlFor="resource-unavailable-edit-end-date">
              Date de fin <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource-unavailable-edit-end-date"
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

          <RHFInput<TUpdateResourceUnavailablePeriodInput>
            name="endTime"
            label="Heure de fin"
            type="time"
            required
          />
        </div>

        <RHFInput<TUpdateResourceUnavailablePeriodInput>
          name="quantity"
          label="Quantité immobilisée"
          type="number"
          placeholder="Toute la ressource"
          popoverContent="Laissez vide pour immobiliser toute la ressource."
        />

        <RHFInput<TUpdateResourceUnavailablePeriodInput>
          name="reason"
          label="Motif"
          type="textarea"
          placeholder="Absence, maintenance, indisponibilité..."
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || ressourcesLoading || isDeleting}
              className="rounded-xl"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetAll}
              disabled={isSubmitting || isDeleting}
              className="rounded-xl"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Réinitialiser
            </Button>
          </div>

          {!deleteConfirmOpen && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isSubmitting || isDeleting}
              className="rounded-xl"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Supprimer
            </Button>
          )}
        </div>

        {deleteConfirmOpen && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Supprimer l&apos;immobilisation ?
              </p>
              <p className="text-sm text-muted-foreground">
                Cette action supprimera cette période du calendrier des
                ressources.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void deletePeriod()}
                disabled={isDeleting}
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {isDeleting ? 'Suppression...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        )}

        {serverError && <p className="text-destructive">{serverError}</p>}
      </form>
    </FormProvider>
  );
}

function toLocalDateTimeParts(value: string): { date: string; time: string } {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}
